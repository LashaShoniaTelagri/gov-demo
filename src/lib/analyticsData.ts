// Hardcoded sample data for the Analytics page. Mirrors the PM's spreadsheet
// (see SS-444 / Confluence demo deck). Numbers are illustrative only — they're
// not derived from any other source. Edit values here without touching JSX.
//
// Row labels are stored as i18n key suffixes (e.g. `totalAssessed`) and
// resolved against the `analytics.*` namespace at render time.

// ─── Country-aware localization ────────────────────────────────────────────
// All sample data is authored in Uzbek terms (Fergana, Bukhara, etc.). When
// the analytics page country selector flips to Georgia, region & municipality
// labels swap positionally to Georgian equivalents while numeric values stay
// identical. Dropdowns + filters use the localized labels, so a user who
// selects "Kakheti" sees rows whose original Uzbek region was Fergana.
export type AnalyticsCountry = 'georgia' | 'uzbekistan';

const REGION_MAP_GEORGIA: Record<string, string> = {
  Fergana: 'Kakheti',
  Bukhara: 'Kvemo Kartli',
  Samarkand: 'Imereti',
  Andijan: 'Samtskhe-Javakheti',
  Tashkent: 'Adjara',
};

const MUNI_MAP_GEORGIA: Record<string, string> = {
  // Fergana → Kakheti
  'Samarkand City': 'Telavi',
  Margilan: 'Kvareli',
  'Fergana City': 'Sighnaghi',
  Furkat: 'Lagodekhi',
  // Bukhara → Kvemo Kartli
  Kokand: 'Marneuli',
  Rishtan: 'Bolnisi',
  Bagdad: 'Gardabani',
  Jizzakh: 'Dmanisi',
  // Samarkand → Imereti
  'Bukhara City': 'Kutaisi',
  Kattakurgan: 'Zestaponi',
  Chirchiq: 'Tkibuli',
  // Andijan → Samtskhe-Javakheti
  Asaka: 'Akhaltsikhe',
  'Andijan City': 'Borjomi',
  Andijan: 'Aspindza',
  Urgut: 'Akhalkalaki',
  // Tashkent → Adjara
  Quva: 'Batumi',
  Kuvasay: 'Kobuleti',
  Yangiyul: 'Khelvachauri',
};

export const localizeRegion = (region: string, country: AnalyticsCountry): string =>
  country === 'georgia' ? REGION_MAP_GEORGIA[region] ?? region : region;

export const localizeMunicipality = (
  muni: string,
  country: AnalyticsCountry,
): string =>
  country === 'georgia' ? MUNI_MAP_GEORGIA[muni] ?? muni : muni;

// Filter options scoped to one country (used by dropdowns on the analytics
// page when a country is selected — Georgia hides Uzbek groups and vice-versa).
export const filterRegionsForCountry = (
  country: AnalyticsCountry,
): GroupedOptions[] =>
  FILTER_REGIONS_GROUPED.filter((g) => g.group === country);

export const filterMunicipalitiesForCountry = (
  country: AnalyticsCountry,
): GroupedOptions[] =>
  FILTER_MUNICIPALITIES_GROUPED.filter((g) => g.group === country);

export interface KpiRow {
  labelKey: string;
  value: string;
}

export const KPI_ROWS: KpiRow[] = [
  { labelKey: 'totalAssessed', value: '2,544' },
  { labelKey: 'bankFarms', value: '113' },
  { labelKey: 'share', value: '4.4%' },
  { labelKey: 'marketAvg', value: '6.67' },
  { labelKey: 'portfolioAvg', value: '6.45' },
];

// Risk & Performance Trends — 3 grouped Portfolio-vs-Market percentage pairs.
// Values stored as fractions (0.0551 = 5.51%) to keep formatting in one place.
export interface RiskTrendRow {
  labelKey: string;
  portfolio: number;
  market: number;
}

export const RISK_TREND_ROWS: RiskTrendRow[] = [
  { labelKey: 'highRisk', portfolio: 0.0551, market: 0.053 },
  { labelKey: 'improved', portfolio: 0.1575, market: 0.162 },
  { labelKey: 'deteriorated', portfolio: 0.3031, market: 0.291 },
];

// Score Distribution — count of farms per band, latest month.
export type ScoreBand = 'Low' | 'Medium' | 'High';

export interface ScoreDistRow {
  band: ScoreBand;
  market: number;
  portfolio: number;
}

export const SCORE_DIST_ROWS: ScoreDistRow[] = [
  { band: 'Low', market: 140, portfolio: 10 },
  { band: 'Medium', market: 1480, portfolio: 68 },
  { band: 'High', market: 924, portfolio: 35 },
];

// Region Benchmark — avg score per region, 1–10 scale.
export interface RegionBenchmarkRow {
  region: string;
  market: number;
  portfolio: number;
}

export const REGION_BENCHMARK_ROWS: RegionBenchmarkRow[] = [
  { region: 'Fergana', market: 6.2, portfolio: 7.43 },
  { region: 'Bukhara', market: 6.57, portfolio: 6.26 },
  { region: 'Samarkand', market: 6.8, portfolio: 6.8 },
  { region: 'Andijan', market: 6.35, portfolio: 6.48 },
  { region: 'Tashkent', market: 6.7, portfolio: 5.83 },
];

// Crop × Region — avg score per (region, source, crop). Source is Market or
// BANK (Bank Portfolio). Rendered as a grouped column chart with a two-tier
// X-axis: outer = region, inner = source.
export type Source = 'Market' | 'BANK';
export const ANALYTICS_CROPS = [
  'Vineyard',
  'Hazelnut',
  'Apple',
  'Peach',
  'Blueberry',
] as const;
export type AnalyticsCrop = (typeof ANALYTICS_CROPS)[number];

export interface CropRegionRow {
  region: string;
  source: Source;
  scores: Record<AnalyticsCrop, number>;
}

// Criteria × Region — avg score per (criterion, source, region). Rendered as
// a grouped column chart with two-tier X-axis (outer = criterion, inner =
// source). Bars per inner group = 5 regions. Numbers come from the PM's XLSX.
export const ANALYTICS_HEATMAP_REGIONS = [
  'Fergana',
  'Bukhara',
  'Samarkand',
  'Andijan',
  'Tashkent',
] as const;
export type AnalyticsHeatmapRegion = (typeof ANALYTICS_HEATMAP_REGIONS)[number];

export interface CriteriaRegionRow {
  criterion: AnalyticsCriterion;
  source: Source;
  scores: Record<AnalyticsHeatmapRegion, number>;
}

export const CRITERIA_REGION_ROWS: CriteriaRegionRow[] = [
  { criterion: 'Climate', source: 'Market', scores: { Fergana: 8.4, Bukhara: 6.17, Samarkand: 7.77, Andijan: 5.09, Tashkent: 8.79 } },
  { criterion: 'Climate', source: 'BANK', scores: { Fergana: 4.97, Bukhara: 6.32, Samarkand: 8.99, Andijan: 6.2, Tashkent: 6.8 } },
  { criterion: 'Irrigation', source: 'Market', scores: { Fergana: 8.19, Bukhara: 5.07, Samarkand: 6.54, Andijan: 7.99, Tashkent: 5.33 } },
  { criterion: 'Irrigation', source: 'BANK', scores: { Fergana: 5.37, Bukhara: 7.19, Samarkand: 5.79, Andijan: 8.25, Tashkent: 4.71 } },
  { criterion: 'Pests', source: 'Market', scores: { Fergana: 4.97, Bukhara: 6.32, Samarkand: 8.99, Andijan: 6.2, Tashkent: 6.8 } },
  { criterion: 'Pests', source: 'BANK', scores: { Fergana: 8.34, Bukhara: 3.35, Samarkand: 6.89, Andijan: 5.11, Tashkent: 9.13 } },
  { criterion: 'Management', source: 'Market', scores: { Fergana: 5.37, Bukhara: 7.19, Samarkand: 5.79, Andijan: 8.25, Tashkent: 4.71 } },
  { criterion: 'Management', source: 'BANK', scores: { Fergana: 8.19, Bukhara: 5.07, Samarkand: 6.54, Andijan: 7.99, Tashkent: 5.33 } },
];

// Weakest Driver Distribution — for each of the 4 criteria, the share (%) of
// farms whose weakest driver is that criterion. Stored as fractions
// (0.20 = 20%) for consistent formatting; counts kept for tooltip detail.
export const ANALYTICS_CRITERIA = [
  'Climate',
  'Irrigation',
  'Management',
  'Pests',
] as const;
export type AnalyticsCriterion = (typeof ANALYTICS_CRITERIA)[number];

export interface WeakestDriverRow {
  criterion: AnalyticsCriterion;
  marketCount: number;
  marketShare: number;
  portfolioCount: number;
  portfolioShare: number;
}

// Monthly Trend - Score: 6 sample rows. Per spec, region/municipality/crop
// are populated only on the first row; later rows inherit visually (empty
// cells). When any filter is applied, the table truncates to first 3 rows
// and the first row reflects the filter selections.
export interface MonthlyTrendRow {
  month: string;
  region: string | null;
  municipality: string | null;
  crop: string | null;
  marketAvg: number;
  portfolioAvg: number;
}

// Monthly Trend - High Risk %: 6 monthly data points, Market vs Portfolio.
// Stored as fractions (0.091 = 9.1%) — formatting happens at render time.
export interface MonthlyHighRiskRow {
  month: string;
  market: number;
  portfolio: number;
}

// Score Band Migration: 9 rows of (from-band → to-band) transitions with
// counts split by Market and Portfolio. Direction (improved/declined/same)
// is derived from the band pair at render time so the table can highlight it.
export type MigrationBand = 'Low' | 'Medium' | 'High';
export type MigrationDirection = 'same' | 'improved' | 'declined';

export interface ScoreMigrationRow {
  from: MigrationBand;
  to: MigrationBand;
  market: number;
  portfolio: number;
}

export const SCORE_MIGRATION_ROWS: ScoreMigrationRow[] = [
  { from: 'Low', to: 'Low', market: 885, portfolio: 23 },
  { from: 'Low', to: 'Medium', market: 83, portfolio: 5 },
  { from: 'Low', to: 'High', market: 2, portfolio: 0 },
  { from: 'Medium', to: 'Low', market: 63, portfolio: 4 },
  { from: 'Medium', to: 'Medium', market: 931, portfolio: 38 },
  { from: 'Medium', to: 'High', market: 28, portfolio: 3 },
  { from: 'High', to: 'Low', market: 3, portfolio: 0 },
  { from: 'High', to: 'Medium', market: 37, portfolio: 2 },
  { from: 'High', to: 'High', market: 512, portfolio: 38 },
];

// RISK Flag - Latest Month: 15 sample farm rows. Per spec, the first 5 rows
// belong to the Bank Portfolio; the remaining 10 belong to the Market. The
// Portfolio/Market toggle filters by `source`.
export type RiskSource = 'Portfolio' | 'Market';
export type RiskFlag = 'Watch' | 'Critical';

export interface RiskFlagRow {
  orchardId: string;
  source: RiskSource;
  region: string;
  municipality: string;
  crop: string;
  currentScore: number;
  prevScore: number;
  weakestCriterion: AnalyticsCriterion;
  riskFlag: RiskFlag;
}

// Lead Opportunity Ranking — 12 high-scoring market opportunities by
// (region, crop). Municipality is empty in the spec data; we keep it as null.
export interface LeadOpportunityRow {
  region: string;
  municipality: string | null;
  crop: string;
  avgScore: number;
}

// Lead Generation – By Scores: 10 sample farms ranked highest-score-first.
export interface LeadByScoreRow {
  region: string;
  municipality: string;
  crop: string;
  farmScore: number;
  farmCode: string;
  gps: string;
  areaHa: number;
}

// Lead Generation – By Migration: one sample farm per band-transition.
// The Categories dropdown lists all 9 transitions; the table shows the row
// matching the user's selection (or all 9 when "All" is chosen).
export interface LeadByMigrationRow {
  fromBand: MigrationBand;
  toBand: MigrationBand;
  farmCode: string;
  gps: string;
  areaHa: number;
}

export const LEAD_BY_MIGRATION_ROWS: LeadByMigrationRow[] = [
  { fromBand: 'Low', toBand: 'Low', farmCode: 'O091', gps: '40.3607, 71.2907', areaHa: 7.8 },
  { fromBand: 'Low', toBand: 'Medium', farmCode: 'O137', gps: '41.4609, 69.5862', areaHa: 4.8 },
  { fromBand: 'Low', toBand: 'High', farmCode: 'O119', gps: '39.8829, 66.2562', areaHa: 4.0 },
  { fromBand: 'Medium', toBand: 'Low', farmCode: 'O178', gps: '39.4222, 67.2451', areaHa: 8.9 },
  { fromBand: 'Medium', toBand: 'Medium', farmCode: 'O090', gps: '40.3727, 71.2887', areaHa: 7.0 },
  { fromBand: 'Medium', toBand: 'High', farmCode: 'O057', gps: '40.1218, 67.8382', areaHa: 7.8 },
  { fromBand: 'High', toBand: 'Low', farmCode: 'O121', gps: '39.8869, 66.2562', areaHa: 5.6 },
  { fromBand: 'High', toBand: 'Medium', farmCode: 'O105', gps: '39.7587, 64.4246', areaHa: 6.4 },
  { fromBand: 'High', toBand: 'High', farmCode: 'O177', gps: '39.4202, 67.2451', areaHa: 8.1 },
];

// Lead Generation – By Criteria: 10 sample farms. The first 4 rows carry a
// criterion label (Climate / Irrigation / Pests / Management); the rest
// inherit visually (no criterion). The Weak/Strong toggle at the top is a
// required filter — for irrigation we're either looking for weak farmers
// (irrigation as a weakness) or strong ones.
export type WeakStrong = 'Weak' | 'Strong';

export interface LeadByCriteriaRow {
  criterion: AnalyticsCriterion | null;
  region: string;
  municipality: string;
  crop: string;
  farmScore: number;
  farmCode: string;
  gps: string;
  areaHa: number;
}

export const LEAD_BY_CRITERIA_ROWS: LeadByCriteriaRow[] = [
  { criterion: 'Climate', region: 'Bukhara', municipality: 'Rishtan', crop: 'Hazelnut', farmScore: 4.6, farmCode: 'O091', gps: '40.3607, 71.2907', areaHa: 7.8 },
  { criterion: 'Irrigation', region: 'Samarkand', municipality: 'Chirchiq', crop: 'Vineyard', farmScore: 4.9, farmCode: 'O137', gps: '41.4609, 69.5862', areaHa: 4.8 },
  { criterion: 'Pests', region: 'Samarkand', municipality: 'Kattakurgan', crop: 'Vineyard', farmScore: 5.2, farmCode: 'O119', gps: '39.8829, 66.2562', areaHa: 4.0 },
  { criterion: 'Management', region: 'Andijan', municipality: 'Urgut', crop: 'Apple', farmScore: 5.3, farmCode: 'O178', gps: '39.4222, 67.2451', areaHa: 8.9 },
  { criterion: null, region: 'Bukhara', municipality: 'Rishtan', crop: 'Hazelnut', farmScore: 5.3, farmCode: 'O090', gps: '40.3727, 71.2887', areaHa: 7.0 },
  { criterion: null, region: 'Bukhara', municipality: 'Jizzakh', crop: 'Hazelnut', farmScore: 5.4, farmCode: 'O057', gps: '40.1218, 67.8382', areaHa: 7.8 },
  { criterion: null, region: 'Samarkand', municipality: 'Kattakurgan', crop: 'Vineyard', farmScore: 5.4, farmCode: 'O121', gps: '39.8869, 66.2562', areaHa: 5.6 },
  { criterion: null, region: 'Samarkand', municipality: 'Bukhara City', crop: 'Vineyard', farmScore: 5.5, farmCode: 'O105', gps: '39.7587, 64.4246', areaHa: 6.4 },
  { criterion: null, region: 'Andijan', municipality: 'Urgut', crop: 'Apple', farmScore: 5.6, farmCode: 'O177', gps: '39.4202, 67.2451', areaHa: 8.1 },
  { criterion: null, region: 'Bukhara', municipality: 'Jizzakh', crop: 'Hazelnut', farmScore: 5.6, farmCode: 'O055', gps: '40.1318, 67.8362', areaHa: 6.2 },
];

export const LEAD_BY_SCORES_ROWS: LeadByScoreRow[] = [
  { region: 'Tashkent', municipality: 'Kuvasay', crop: 'Blueberry', farmScore: 9.3, farmCode: 'O220', gps: '40.2776, 71.9808', areaHa: 16.8 },
  { region: 'Tashkent', municipality: 'Yangiyul', crop: 'Blueberry', farmScore: 9.2, farmCode: 'O254', gps: '41.0900, 69.0431', areaHa: 16.8 },
  { region: 'Samarkand', municipality: 'Chirchiq', crop: 'Apple', farmScore: 9.1, farmCode: 'O145', gps: '41.4629, 69.5882', areaHa: 9.7 },
  { region: 'Samarkand', municipality: 'Chirchiq', crop: 'Apple', farmScore: 9.0, farmCode: 'O143', gps: '41.4589, 69.5882', areaHa: 8.1 },
  { region: 'Samarkand', municipality: 'Chirchiq', crop: 'Apple', farmScore: 9.0, farmCode: 'O144', gps: '41.4609, 69.5882', areaHa: 8.9 },
  { region: 'Fergana', municipality: 'Margilan', crop: 'Blueberry', farmScore: 8.9, farmCode: 'O050', gps: '40.4683, 71.7186', areaHa: 16.8 },
  { region: 'Samarkand', municipality: 'Bukhara City', crop: 'Apple', farmScore: 8.9, farmCode: 'O111', gps: '39.7707, 64.4246', areaHa: 9.7 },
  { region: 'Tashkent', municipality: 'Quva', crop: 'Blueberry', farmScore: 8.9, farmCode: 'O236', gps: '40.5071, 72.0782', areaHa: 16.0 },
  { region: 'Tashkent', municipality: 'Yangiyul', crop: 'Blueberry', farmScore: 8.9, farmCode: 'O253', gps: '41.0880, 69.0431', areaHa: 16.0 },
  { region: 'Fergana', municipality: 'Fergana City', crop: 'Blueberry', farmScore: 8.8, farmCode: 'O013', gps: '40.3902, 71.7803', areaHa: 14.4 },
];

export const LEAD_OPPORTUNITY_ROWS: LeadOpportunityRow[] = [
  { region: 'Fergana', municipality: null, crop: 'Blueberry', avgScore: 8.6 },
  { region: 'Tashkent', municipality: null, crop: 'Blueberry', avgScore: 8.7 },
  { region: 'Samarkand', municipality: null, crop: 'Apple', avgScore: 8.6 },
  { region: 'Tashkent', municipality: null, crop: 'Vineyard', avgScore: 8.1 },
  { region: 'Andijan', municipality: null, crop: 'Peach', avgScore: 7.6 },
  { region: 'Bukhara', municipality: null, crop: 'Vineyard', avgScore: 8.0 },
  { region: 'Fergana', municipality: null, crop: 'Vineyard', avgScore: 7.6 },
  { region: 'Bukhara', municipality: null, crop: 'Peach', avgScore: 7.7 },
  { region: 'Andijan', municipality: null, crop: 'Hazelnut', avgScore: 7.0 },
  { region: 'Fergana', municipality: null, crop: 'Apple', avgScore: 7.2 },
  { region: 'Bukhara', municipality: null, crop: 'Apple', avgScore: 6.7 },
  { region: 'Tashkent', municipality: null, crop: 'Apple', avgScore: 7.2 },
];

export const RISK_FLAG_ROWS: RiskFlagRow[] = [
  // Portfolio (first 5)
  { orchardId: 'O227', source: 'Portfolio', region: 'Tashkent', municipality: 'Quva', crop: 'Hazelnut', currentScore: 5, prevScore: 4, weakestCriterion: 'Irrigation', riskFlag: 'Watch' },
  { orchardId: 'O203', source: 'Portfolio', region: 'Andijan', municipality: 'Asaka', crop: 'Blueberry', currentScore: 4, prevScore: 2, weakestCriterion: 'Pests', riskFlag: 'Critical' },
  { orchardId: 'O217', source: 'Portfolio', region: 'Tashkent', municipality: 'Kuvasay', crop: 'Peach', currentScore: 5, prevScore: 3, weakestCriterion: 'Climate', riskFlag: 'Critical' },
  { orchardId: 'O168', source: 'Portfolio', region: 'Andijan', municipality: 'Andijan City', crop: 'Blueberry', currentScore: 3, prevScore: 2, weakestCriterion: 'Pests', riskFlag: 'Watch' },
  { orchardId: 'O028', source: 'Portfolio', region: 'Fergana', municipality: 'Samarkand City', crop: 'Peach', currentScore: 5, prevScore: 4, weakestCriterion: 'Climate', riskFlag: 'Watch' },
  // Market (remaining 10)
  { orchardId: 'O234', source: 'Market', region: 'Tashkent', municipality: 'Quva', crop: 'Peach', currentScore: 5, prevScore: 4, weakestCriterion: 'Climate', riskFlag: 'Watch' },
  { orchardId: 'O114', source: 'Market', region: 'Samarkand', municipality: 'Bukhara City', crop: 'Peach', currentScore: 4, prevScore: 3, weakestCriterion: 'Climate', riskFlag: 'Watch' },
  { orchardId: 'O115', source: 'Market', region: 'Samarkand', municipality: 'Bukhara City', crop: 'Peach', currentScore: 6, prevScore: 3, weakestCriterion: 'Climate', riskFlag: 'Critical' },
  { orchardId: 'O075', source: 'Market', region: 'Bukhara', municipality: 'Kokand', crop: 'Hazelnut', currentScore: 5, prevScore: 4, weakestCriterion: 'Irrigation', riskFlag: 'Watch' },
  { orchardId: 'O091', source: 'Market', region: 'Bukhara', municipality: 'Rishtan', crop: 'Hazelnut', currentScore: 6, prevScore: 5, weakestCriterion: 'Irrigation', riskFlag: 'Watch' },
  { orchardId: 'O103', source: 'Market', region: 'Samarkand', municipality: 'Bukhara City', crop: 'Vineyard', currentScore: 6, prevScore: 4, weakestCriterion: 'Irrigation', riskFlag: 'Critical' },
  { orchardId: 'O104', source: 'Market', region: 'Samarkand', municipality: 'Bukhara City', crop: 'Vineyard', currentScore: 4, prevScore: 3, weakestCriterion: 'Irrigation', riskFlag: 'Watch' },
  { orchardId: 'O119', source: 'Market', region: 'Samarkand', municipality: 'Kattakurgan', crop: 'Vineyard', currentScore: 3, prevScore: 2, weakestCriterion: 'Irrigation', riskFlag: 'Watch' },
  { orchardId: 'O121', source: 'Market', region: 'Samarkand', municipality: 'Kattakurgan', crop: 'Vineyard', currentScore: 6, prevScore: 3, weakestCriterion: 'Irrigation', riskFlag: 'Critical' },
  { orchardId: 'O133', source: 'Market', region: 'Samarkand', municipality: 'Kattakurgan', crop: 'Blueberry', currentScore: 5, prevScore: 4, weakestCriterion: 'Climate', riskFlag: 'Watch' },
];

const BAND_RANK: Record<MigrationBand, number> = { Low: 0, Medium: 1, High: 2 };
export const migrationDirection = (
  from: MigrationBand,
  to: MigrationBand,
): MigrationDirection => {
  if (from === to) return 'same';
  return BAND_RANK[to] > BAND_RANK[from] ? 'improved' : 'declined';
};

export const MONTHLY_HIGH_RISK_ROWS: MonthlyHighRiskRow[] = [
  { month: '2026-01', market: 0.091, portfolio: 0.124 },
  { month: '2026-02', market: 0.083, portfolio: 0.133 },
  { month: '2026-03', market: 0.067, portfolio: 0.115 },
  { month: '2026-04', market: 0.055, portfolio: 0.106 },
  { month: '2026-05', market: 0.043, portfolio: 0.062 },
  { month: '2026-06', market: 0.055, portfolio: 0.089 },
];

export const MONTHLY_TREND_ROWS: MonthlyTrendRow[] = [
  { month: '2026-01', region: 'Kakheti', municipality: 'Kvareli', crop: 'Apple', marketAvg: 6.5, portfolioAvg: 6.7 },
  { month: '2026-02', region: null, municipality: null, crop: null, marketAvg: 6.8, portfolioAvg: 7.1 },
  { month: '2026-03', region: null, municipality: null, crop: null, marketAvg: 7.2, portfolioAvg: 7.4 },
  { month: '2026-04', region: null, municipality: null, crop: null, marketAvg: 7.1, portfolioAvg: 6.8 },
  { month: '2026-05', region: null, municipality: null, crop: null, marketAvg: 7.2, portfolioAvg: 7.0 },
  { month: '2026-06', region: null, municipality: null, crop: null, marketAvg: 6.8, portfolioAvg: 6.9 },
];

// Filter dropdown options. Spec: regions and municipalities from Georgia AND
// Uzbekistan, grouped by country in the UI (rendered as <optgroup>). The
// `group` value is an i18n suffix matched against `grid.countries.*`.
export interface GroupedOptions {
  group: 'georgia' | 'uzbekistan';
  options: string[];
}

export const FILTER_REGIONS_GROUPED: GroupedOptions[] = [
  {
    group: 'georgia',
    options: [
      'Kakheti', 'Kvemo Kartli', 'Shida Kartli', 'Samtskhe-Javakheti', 'Imereti',
      'Guria', 'Samegrelo', 'Racha-Lechkhumi', 'Adjara', 'Mtskheta-Mtianeti',
      'Tbilisi',
    ],
  },
  {
    group: 'uzbekistan',
    options: ['Fergana', 'Bukhara', 'Samarkand', 'Andijan', 'Tashkent'],
  },
];

export const FILTER_MUNICIPALITIES_GROUPED: GroupedOptions[] = [
  {
    group: 'georgia',
    options: [
      'Telavi', 'Kvareli', 'Sighnaghi', 'Akhmeta', 'Lagodekhi',
      'Tbilisi', 'Kutaisi', 'Batumi', 'Zugdidi', 'Gori',
    ],
  },
  {
    group: 'uzbekistan',
    options: ['Margilan', 'Furkat', 'Bagdad', 'Kokand', 'Andijan', 'Asaka'],
  },
];

export const FILTER_CROPS: string[] = ['Vineyard', 'Hazelnut', 'Apple', 'Peach', 'Blueberry'];

export const WEAKEST_DRIVER_ROWS: WeakestDriverRow[] = [
  { criterion: 'Climate', marketCount: 120, marketShare: 0.2, portfolioCount: 10, portfolioShare: 0.28 },
  { criterion: 'Irrigation', marketCount: 240, marketShare: 0.28, portfolioCount: 8, portfolioShare: 0.24 },
  { criterion: 'Management', marketCount: 320, marketShare: 0.35, portfolioCount: 6, portfolioShare: 0.25 },
  { criterion: 'Pests', marketCount: 90, marketShare: 0.17, portfolioCount: 5, portfolioShare: 0.23 },
];

export const CROP_REGION_ROWS: CropRegionRow[] = [
  {
    region: 'Fergana',
    source: 'Market',
    scores: { Vineyard: 8.4, Hazelnut: 6.17, Apple: 7.77, Peach: 5.09, Blueberry: 8.79 },
  },
  {
    region: 'Fergana',
    source: 'BANK',
    scores: { Vineyard: 4.97, Hazelnut: 6.32, Apple: 8.99, Peach: 6.2, Blueberry: 6.8 },
  },
  {
    region: 'Bukhara',
    source: 'Market',
    scores: { Vineyard: 8.19, Hazelnut: 5.07, Apple: 6.54, Peach: 7.99, Blueberry: 5.33 },
  },
  {
    region: 'Bukhara',
    source: 'BANK',
    scores: { Vineyard: 5.37, Hazelnut: 7.19, Apple: 5.79, Peach: 8.25, Blueberry: 4.71 },
  },
  {
    region: 'Samarkand',
    source: 'Market',
    scores: { Vineyard: 4.97, Hazelnut: 6.32, Apple: 8.99, Peach: 6.2, Blueberry: 6.8 },
  },
  {
    region: 'Samarkand',
    source: 'BANK',
    scores: { Vineyard: 8.34, Hazelnut: 3.35, Apple: 6.89, Peach: 5.11, Blueberry: 9.13 },
  },
  {
    region: 'Andijan',
    source: 'Market',
    scores: { Vineyard: 5.37, Hazelnut: 7.19, Apple: 5.79, Peach: 8.25, Blueberry: 4.71 },
  },
  {
    region: 'Andijan',
    source: 'BANK',
    scores: { Vineyard: 8.19, Hazelnut: 5.07, Apple: 6.54, Peach: 7.99, Blueberry: 5.33 },
  },
  {
    region: 'Tashkent',
    source: 'Market',
    scores: { Vineyard: 8.34, Hazelnut: 3.35, Apple: 6.89, Peach: 5.11, Blueberry: 9.13 },
  },
  {
    region: 'Tashkent',
    source: 'BANK',
    scores: { Vineyard: 4.97, Hazelnut: 6.32, Apple: 8.99, Peach: 6.2, Blueberry: 6.8 },
  },
];
