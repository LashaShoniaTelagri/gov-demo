import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import sgMail from '@sendgrid/mail';

const RATE_PER_HA = { 'one-time': 1, annual: 3 };
const PRICE_PER_CROP = 5000;

const ssm = new SSMClient({});

let cachedApiKey = null;
let cachedGrid = null;

const getApiKey = async () => {
  if (cachedApiKey) return cachedApiKey;
  const paramName = process.env.SENDGRID_API_KEY_PARAM;
  if (!paramName) throw new Error('SENDGRID_API_KEY_PARAM not set');
  const res = await ssm.send(
    new GetParameterCommand({ Name: paramName, WithDecryption: true }),
  );
  cachedApiKey = res.Parameter?.Value;
  if (!cachedApiKey) throw new Error('SendGrid API key not found in SSM');
  sgMail.setApiKey(cachedApiKey);
  return cachedApiKey;
};

const getGrid = async () => {
  if (cachedGrid) return cachedGrid;
  const raw = await readFile(new URL('./grid-georgia.geojson', import.meta.url), 'utf8');
  const fc = JSON.parse(raw);
  cachedGrid = new Map(
    fc.features.map((f) => [String(f.properties.cell_id), Number(f.properties.area_ha ?? 0)]),
  );
  return cachedGrid;
};

const calculatePrice = ({ areaHa, crops, serviceType }) => {
  const areaCost = Math.max(0, areaHa) * (RATE_PER_HA[serviceType] ?? 0);
  const cropCost = crops.length * PRICE_PER_CROP;
  return areaCost + cropCost;
};

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
});

const respond = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders(),
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});

  let payload;
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return respond(400, { ok: false, error: 'Invalid JSON' });
  }

  const { selectedCellIds, totalAreaHa, crops, serviceType, expectedPriceUsd, submittedAt } =
    payload ?? {};

  if (
    !Array.isArray(selectedCellIds) ||
    selectedCellIds.length === 0 ||
    !Array.isArray(crops) ||
    crops.length === 0 ||
    !['one-time', 'annual'].includes(serviceType) ||
    typeof totalAreaHa !== 'number' ||
    typeof expectedPriceUsd !== 'number'
  ) {
    return respond(400, { ok: false, error: 'Invalid payload' });
  }

  const grid = await getGrid();
  const serverAreaHa = selectedCellIds.reduce((sum, id) => sum + (grid.get(String(id)) ?? 0), 0);
  const serverPrice = calculatePrice({ areaHa: serverAreaHa, crops, serviceType });

  const priceDelta = Math.abs(serverPrice - expectedPriceUsd);
  if (priceDelta > 1) {
    return respond(400, {
      ok: false,
      error: `Price mismatch: server=${serverPrice} client=${expectedPriceUsd}`,
    });
  }

  const orderId = randomUUID();
  const to = (process.env.TO_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.FROM_EMAIL;

  if (!from || to.length === 0) {
    return respond(500, { ok: false, error: 'Email configuration missing' });
  }

  await getApiKey();

  const cropList = crops.join(', ');
  const serviceLabel =
    serviceType === 'annual' ? 'Annual Monitoring' : 'One-time Monitoring';

  const html = `
    <h2>New monitoring order</h2>
    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse">
      <tr><td><b>Order ID</b></td><td>${orderId}</td></tr>
      <tr><td><b>Submitted at</b></td><td>${submittedAt ?? new Date().toISOString()}</td></tr>
      <tr><td><b>Service</b></td><td>${serviceLabel}</td></tr>
      <tr><td><b>Crops</b></td><td>${cropList}</td></tr>
      <tr><td><b>Cells selected</b></td><td>${selectedCellIds.length}</td></tr>
      <tr><td><b>Total area (ha)</b></td><td>${serverAreaHa.toLocaleString('en-US', { maximumFractionDigits: 1 })}</td></tr>
      <tr><td><b>Total price (USD)</b></td><td>$${serverPrice.toLocaleString('en-US')}</td></tr>
      <tr><td><b>Cell IDs</b></td><td style="font-family:monospace;font-size:11px">${selectedCellIds.join(', ')}</td></tr>
    </table>
  `;

  try {
    await sgMail.send({
      to,
      from,
      subject: `New monitoring order — ${serviceLabel} — $${serverPrice.toLocaleString('en-US')}`,
      html,
    });
  } catch (err) {
    console.error('SendGrid error', err);
    return respond(502, { ok: false, error: 'Email send failed' });
  }

  return respond(200, { ok: true, orderId });
};
