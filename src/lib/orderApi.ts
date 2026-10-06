import type { ServiceType } from './pricing';

export interface OrderPayload {
  selectedCellIds: string[];
  totalAreaHa: number;
  crops: string[];
  serviceType: ServiceType;
  expectedPriceUsd: number;
  submittedAt: string;
}

export interface OrderResponse {
  ok: boolean;
  orderId?: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_ORDER_API_URL as string | undefined;

export const submitOrder = async (payload: OrderPayload): Promise<OrderResponse> => {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 600));
    const orderId = `dev-${Date.now()}`;
    // eslint-disable-next-line no-console
    console.info('[orderApi] VITE_ORDER_API_URL not set — mock submit', { orderId, payload });
    return { ok: true, orderId };
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as OrderResponse;
  if (!res.ok) {
    return { ok: false, error: body.error ?? `HTTP ${res.status}` };
  }
  return body;
};
