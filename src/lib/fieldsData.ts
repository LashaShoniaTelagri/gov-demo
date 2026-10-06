// Score is a 1.0–10.0 decimal (1 decimal of precision) per the GIS team's
// WIthinCell deliverable. Display bands collapse it back to 3 colors.
export type Score = number;
export type Crop = 'Apple' | 'Peach';

export interface FieldProperties {
  field_id: string;
  cell_id: string | null;
  crop: Crop | null;
  is_cell?: boolean;
  score: Score;
  area_ha: number;
  region: string;
  municipality: string | null;
}

export type FieldFeature = GeoJSON.Feature<GeoJSON.Geometry, FieldProperties>;
export type FieldFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  FieldProperties
>;

export type ScoreBucket = 'low' | 'mid' | 'high';

// Cutoffs per spec: low 1.0–3.9, mid 4.0–6.9, high 7.0–10.0.
export const scoreBucket = (score: number): ScoreBucket => {
  if (score < 4) return 'low';
  if (score < 7) return 'mid';
  return 'high';
};

export const SCORE_BUCKETS: Array<{
  id: ScoreBucket;
  range: [number, number];
}> = [
  { id: 'low', range: [1, 3.9] },
  { id: 'mid', range: [4, 6.9] },
  { id: 'high', range: [7, 10] },
];

const BUCKET_COLORS: Record<ScoreBucket, { stroke: string; fill: string }> = {
  low: { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.35)' },
  mid: { stroke: '#d97706', fill: 'rgba(234, 179, 8, 0.40)' },
  high: { stroke: '#16a34a', fill: 'rgba(22, 163, 74, 0.40)' },
};

export const getScoreColor = (score: number) => BUCKET_COLORS[scoreBucket(score)];

export const ALL_CROPS: Crop[] = ['Apple', 'Peach'];

export type MonitoringCountry = 'georgia' | 'uzbekistan';

export const MONITORING_COUNTRY_CENTERS: Record<
  MonitoringCountry,
  { center: [number, number]; zoom: number }
> = {
  georgia: { center: [42.0, 43.5], zoom: 7 },
  // Matches the GIS team's WithinCell_Fields_UZ fitBounds (west Fergana valley
  // near Khujand). fitBounds in FieldsMap zooms precisely to the data on load.
  uzbekistan: { center: [40.42, 70.89], zoom: 11 },
};

const FIELDS_URLS: Record<MonitoringCountry, string> = {
  georgia: '/grids/fields-georgia.geojson',
  uzbekistan: '/grids/fields-uzbekistan.geojson',
};

const AGRI_OVERLAY_URLS: Record<MonitoringCountry, string> = {
  georgia: '/grids/grid-georgia-agri.geojson',
  uzbekistan: '/grids/grid-uzbekistan.geojson',
};

export const fieldsUrl = (country: MonitoringCountry) => FIELDS_URLS[country];
export const agriOverlayUrl = (country: MonitoringCountry) =>
  AGRI_OVERLAY_URLS[country];

// Back-compat constants kept for any existing imports.
export const FIELDS_URL = FIELDS_URLS.georgia;
export const AGRI_OVERLAY_URL = AGRI_OVERLAY_URLS.georgia;

export const fetchFields = async (
  country: MonitoringCountry = 'georgia',
): Promise<FieldFeatureCollection> => {
  const res = await fetch(fieldsUrl(country));
  if (!res.ok) throw new Error(`Fields fetch failed: ${res.status}`);
  return res.json();
};
