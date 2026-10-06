#!/usr/bin/env node
// Normalizes raw GIS deliverables into spec-compliant output files.
// Inputs: Georgia_Grid/ and Fergana_Grid/ (from GIS team — see SS-444).
// Outputs to public/grids/:
//   - grid-georgia.geojson       (Georgia agri-only cell grid, clickable —
//                                 covers only agricultural zones, not all
//                                 of Georgia. Sourced from grid_georgia_agri,
//                                 NOT grid_georgia_full.)
//   - grid-georgia-agri.geojson  (agri overlay halo, geometry-only)
//   - grid-uzbekistan.geojson    (Fergana valley grid)
//   - fields-georgia.geojson     (analyzed fields inside one Kakheti cell)
//   - fields-uzbekistan.geojson  (analyzed fields inside one Fergana cell)
//   - unique-municipalities.json (audit list for translation coverage)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'public/grids');
mkdirSync(OUT_DIR, { recursive: true });

// Long admin-1 names from the source files → app-side short forms.
const GEORGIA_REGION_MAP = {
  'Autonomous Republic of Abkhazia': 'Abkhazia',
  'Autonomous Republic of Adjara': 'Adjara',
  'Racha-Lechkhumi and Kvemo Svaneti': 'Racha-Lechkhumi',
  'Samegrelo-Zemo Svaneti': 'Samegrelo',
};

// Shapefile DBF truncates field values at 10 chars; restore the few that lose
// meaningful tail characters. Anything not listed passes through unchanged.
const UZ_DISTRICT_MAP = {
  'Khanabad c': 'Khanabad',
  'Kokand cit': 'Kokand',
  'Margilan c': 'Margilan',
  'Yangikurga': 'Yangikurgan',
};

const round6 = (n) => Math.round(n * 1e6) / 1e6;

// Nominal full cell is 10km × 10km = 10,000 ha; latitude projection produces
// values clustered tightly around 10,000 for intact cells, while border cells
// fall well below (e.g. 6,796 / 8,508). Snap anything within ±5% to a clean
// 10,000 — wider than the visible cluster but safely below border-cell sizes.
const FULL_CELL_HA = 10000;
const FULL_CELL_MIN = 9500;
const FULL_CELL_MAX = 10500;
const snapFullCell = (ha) =>
  ha >= FULL_CELL_MIN && ha <= FULL_CELL_MAX ? FULL_CELL_HA : ha;

const mapCoords = (c) =>
  typeof c[0] === 'number' ? [round6(c[0]), round6(c[1])] : c.map(mapCoords);

const roundGeometry = (geom) => ({ ...geom, coordinates: mapCoords(geom.coordinates) });

const readGeojson = (relPath) =>
  JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf8'));

const normalizeGeorgia = () => {
  // Use the agri-restricted grid as the clickable layer — matches the prior
  // demo's footprint (cells only over agricultural zones, not whole country).
  const raw = readGeojson('Georgia_Grid/grid_georgia_agri.geojson');
  const features = raw.features.map((f) => {
    const p = f.properties ?? {};
    const rawRegion = String(p.Region ?? '');
    const region = GEORGIA_REGION_MAP[rawRegion] ?? rawRegion;
    const municipality = String(p.Municipali ?? '').trim() || null;
    return {
      type: 'Feature',
      properties: {
        cell_id: `GE-${p.ID}`,
        area_ha: snapFullCell(Number(p['Area (ha)'] ?? 0)),
        country: 'GE',
        region,
        municipality,
      },
      geometry: roundGeometry(f.geometry),
    };
  });
  return { type: 'FeatureCollection', name: 'grid-georgia', features };
};

const normalizeGeorgiaAgriOverlay = () => {
  const raw = readGeojson('Georgia_Grid/grid_georgia_agri.geojson');
  const features = raw.features.map((f) => ({
    type: 'Feature',
    properties: {},
    geometry: roundGeometry(f.geometry),
  }));
  return { type: 'FeatureCollection', name: 'grid-georgia-agri', features };
};

const normalizeUzbekistan = () => {
  const raw = readGeojson('Fergana_Grid/Fergana_Grid.geojson');
  const features = raw.features.map((f) => {
    const p = f.properties ?? {};
    const id = Math.trunc(Number(p.id ?? p.ID ?? 0));
    const rawDistrict = String(p.District ?? '').trim();
    const municipality = (UZ_DISTRICT_MAP[rawDistrict] ?? rawDistrict) || null;
    return {
      type: 'Feature',
      properties: {
        cell_id: `UZ-${id}`,
        area_ha: snapFullCell(Number(p['Area (ha)'] ?? 0)),
        country: 'UZ',
        region: String(p.Region ?? 'Fergana'),
        municipality,
      },
      geometry: roundGeometry(f.geometry),
    };
  });
  return { type: 'FeatureCollection', name: 'grid-uzbekistan', features };
};

// Flattens any (Multi)Polygon coordinate list down to [[lng,lat], ...] vertices.
const flattenCoords = (coords, out = []) => {
  if (typeof coords[0] === 'number') {
    out.push(coords);
    return out;
  }
  for (const c of coords) flattenCoords(c, out);
  return out;
};

const centroid = (geom) => {
  const pts = flattenCoords(geom.coordinates);
  let x = 0, y = 0;
  for (const [lng, lat] of pts) { x += lng; y += lat; }
  return [x / pts.length, y / pts.length];
};

const pointInRing = (pt, ring) => {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const pointInGeometry = (pt, geom) => {
  const polygons =
    geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
  for (const polygon of polygons) {
    if (!polygon.length) continue;
    if (pointInRing(pt, polygon[0])) return true;
  }
  return false;
};

// Locate the grid cell containing `point`. Falls back to the cell with closest
// centroid if no cell strictly contains it (covers fields lying right on a
// border edge after coordinate rounding).
const findParent = (point, grid) => {
  for (const f of grid.features) {
    if (pointInGeometry(point, f.geometry)) {
      const p = f.properties;
      return {
        cell_id: p.cell_id,
        region: p.region,
        municipality: p.municipality,
      };
    }
  }
  let best = null;
  let bestDist = Infinity;
  for (const f of grid.features) {
    const [cx, cy] = centroid(f.geometry);
    const d = (cx - point[0]) ** 2 + (cy - point[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  const p = best.properties;
  return { cell_id: p.cell_id, region: p.region, municipality: p.municipality };
};

// Score from the GIS deliverable is a float 1.0–10.0 (1 decimal). The
// "Background" row is the cell-bounding polygon and carries a placeholder
// score that should not be rendered — the app gates on `is_cell` before
// reading score. We still pass it through untouched so the round-trip is
// inspectable in the geojson.
const round1 = (n) => Math.round(n * 10) / 10;

// Per the GIS deliverable spec, all within-cell fields belong to a single
// parent cell — the `Background` row IS that cell's bounding polygon. We
// resolve the parent via the Background row's centroid (unambiguous) and
// stamp the same parent onto every sibling field; per-field centroid lookup
// can drift to a neighbor cell when a field touches the cell boundary.
const normalizeWithinCellFields = ({
  inputPath,
  fcName,
  fieldIdPrefix,
  parentGrid,
}) => {
  const raw = readGeojson(inputPath);
  const isCellRow = (f) => {
    const c = String(f.properties?.Crop ?? '').trim();
    return c !== 'Apple' && c !== 'Peach';
  };
  const cellRow = raw.features.find(isCellRow) ?? raw.features[0];
  const parent = findParent(centroid(roundGeometry(cellRow.geometry)), parentGrid);
  const features = raw.features.map((f) => {
    const p = f.properties ?? {};
    const rawCrop = String(p.Crop ?? '').trim();
    const isCell = isCellRow(f);
    const crop = isCell ? null : rawCrop;
    const score = round1(Number(p.Score ?? 0));
    const area_ha = Number(p['Area (ha)'] ?? 0);
    return {
      type: 'Feature',
      properties: {
        field_id: `${fieldIdPrefix}-${p.id ?? p.ID ?? 0}`,
        cell_id: parent.cell_id,
        crop,
        is_cell: isCell,
        score,
        area_ha,
        region: parent.region,
        municipality: parent.municipality,
      },
      geometry: roundGeometry(f.geometry),
    };
  });
  return { type: 'FeatureCollection', name: fcName, features };
};

const collectMunicipalities = (...fcs) => {
  const set = new Set();
  for (const fc of fcs) {
    for (const f of fc.features) {
      const m = f.properties?.municipality;
      if (m) set.add(`${f.properties.country ?? ''}|${m}`);
    }
  }
  return Array.from(set).sort();
};

const writeFc = (fc, filename) => {
  const path = resolve(OUT_DIR, filename);
  writeFileSync(path, JSON.stringify(fc));
  const bytes = readFileSync(path).length;
  console.log(
    `  ${filename}: ${fc.features.length} features, ${(bytes / 1024 / 1024).toFixed(2)} MB`,
  );
};

console.log('Normalizing grids...');
const georgia = normalizeGeorgia();
const uzbekistan = normalizeUzbekistan();
writeFc(georgia, 'grid-georgia.geojson');
writeFc(uzbekistan, 'grid-uzbekistan.geojson');
writeFc(normalizeGeorgiaAgriOverlay(), 'grid-georgia-agri.geojson');
writeFc(
  normalizeWithinCellFields({
    inputPath: 'Georgia_Grid/WIthinCell_Fields.geojson',
    fcName: 'fields-georgia',
    fieldIdPrefix: 'GE-F',
    parentGrid: georgia,
  }),
  'fields-georgia.geojson',
);
writeFc(
  normalizeWithinCellFields({
    inputPath: 'Fergana_Grid/WithinCell_Fields_UZ.geojson',
    fcName: 'fields-uzbekistan',
    fieldIdPrefix: 'UZ-F',
    parentGrid: uzbekistan,
  }),
  'fields-uzbekistan.geojson',
);

const municipalities = collectMunicipalities(georgia, uzbekistan);
writeFileSync(
  resolve(OUT_DIR, 'unique-municipalities.json'),
  JSON.stringify(municipalities, null, 2),
);
console.log(`  unique-municipalities.json: ${municipalities.length} entries`);
console.log('Done.');
