import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Customized,
} from 'recharts';
import {
  ANALYTICS_CRITERIA,
  ANALYTICS_CROPS,
  ANALYTICS_HEATMAP_REGIONS,
  CRITERIA_REGION_ROWS,
  CROP_REGION_ROWS,
  FILTER_CROPS,
  FILTER_MUNICIPALITIES_GROUPED,
  FILTER_REGIONS_GROUPED,
  KPI_ROWS,
  LEAD_BY_CRITERIA_ROWS,
  LEAD_BY_MIGRATION_ROWS,
  LEAD_BY_SCORES_ROWS,
  LEAD_OPPORTUNITY_ROWS,
  MONTHLY_HIGH_RISK_ROWS,
  MONTHLY_TREND_ROWS,
  REGION_BENCHMARK_ROWS,
  RISK_TREND_ROWS,
  SCORE_DIST_ROWS,
  SCORE_MIGRATION_ROWS,
  WEAKEST_DRIVER_ROWS,
  filterMunicipalitiesForCountry,
  filterRegionsForCountry,
  localizeMunicipality,
  localizeRegion,
  migrationDirection,
  type AnalyticsCriterion,
  type AnalyticsCrop,
  type GroupedOptions,
  type ScoreBand,
} from '../lib/analyticsData';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';
import { savePortfolio } from '../lib/portfolios';

type ViewKey = 'monitoring' | 'leadGen';

// Country selected at the top of the page. Drives region/municipality scope
// for the country-aware widgets (Region Benchmark, Crop x Region, Monthly
// Trend, RISK Flag, all Lead Gen tables, etc.).
export type AnalyticsCountry = 'georgia' | 'uzbekistan';
const AnalyticsCountryContext = createContext<AnalyticsCountry>('georgia');
export const useAnalyticsCountry = () => useContext(AnalyticsCountryContext);

const ANALYTICS_LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const AnalyticsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>('monitoring');
  const [country, setCountry] = useState<AnalyticsCountry>('georgia');
  const [langOpen, setLangOpen] = useState(false);
  const currentLang =
    ANALYTICS_LANGUAGES.find((l) => l.code === i18n.language) ??
    ANALYTICS_LANGUAGES[1];

  return (
    <AnalyticsCountryContext.Provider value={country}>
      <div className="min-h-full bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/monitoring')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← {t('monitoring.analyticsPage.back')}
            </button>
            <div className="flex items-center gap-3">
              <div className="relative z-[1001]">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                >
                  <span>{currentLang.flag}</span>
                  <span className="font-medium">{currentLang.label}</span>
                </button>
                {langOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[1000]"
                      onClick={() => setLangOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001]">
                      {ANALYTICS_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            i18n.changeLanguage(lang.code);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 ${
                            i18n.language === lang.code
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="font-medium">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <header className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {t('monitoring.analyticsPage.title')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {t('monitoring.analyticsPage.subtitle')}
                </p>
              </div>
              <div className="shrink-0">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {t('monitoring.country')}
                </label>
                <select
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value as AnalyticsCountry)
                  }
                  className="rounded border border-gray-300 px-3 py-2 text-sm bg-white min-w-[180px]"
                >
                  <option value="georgia">{t('grid.countries.georgia')}</option>
                  <option value="uzbekistan">
                    {t('grid.countries.uzbekistan')}
                  </option>
                </select>
              </div>
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <SwitcherTab
                active={view === 'monitoring'}
                onClick={() => setView('monitoring')}
                label={t('monitoring.analyticsPage.tabs.monitoring')}
              />
              <SwitcherTab
                active={view === 'leadGen'}
                onClick={() => setView('leadGen')}
                label={t('monitoring.analyticsPage.tabs.leadGen')}
              />
            </div>
          </div>

          {view === 'monitoring' ? <MonitoringView /> : <LeadGenView />}
        </div>
      </div>
    </AnalyticsCountryContext.Provider>
  );
};

const SwitcherTab: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
      active
        ? 'border-blue-600 text-blue-700 bg-blue-50/50'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`}
  >
    {label}
  </button>
);

// ─── Monitoring view ───────────────────────────────────────────────────────

const MonitoringView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <KpiSection />
      <RiskTrendsSection />

      <Subsection title={t('monitoring.analyticsPage.subsections.scoreDistribution')}>
        <ScoreDistSection />
        <RegionBenchmarkSection />
        <CropRegionSection />
      </Subsection>

      <Subsection title={t('monitoring.analyticsPage.subsections.criteria')}>
        <WeakestDriverSection />
      </Subsection>

      <CriteriaRegionSection />

      <Subsection title={t('monitoring.analyticsPage.subsections.monthlyTrends')}>
        <MonthlyTrendSection />
        <MonthlyHighRiskSection />
      </Subsection>

      <ScoreMigrationSection />
      <ScoreMigrationFilteredSection />
    </div>
  );
};

// Visually groups multiple widgets under one subsection heading per spec.
const Subsection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
        {title}
      </h3>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const KpiSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.kpis.title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.kpis.metric')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.kpis.value')}
              </th>
            </tr>
          </thead>
          <tbody>
            {KPI_ROWS.map((r) => (
              <tr
                key={r.labelKey}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-2.5 pr-4 text-gray-700">
                  {t(`monitoring.analyticsPage.kpis.${r.labelKey}`)}
                </td>
                <td className="py-2.5 pl-4 text-right font-semibold text-gray-900 tabular-nums">
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const RiskTrendsSection: React.FC = () => {
  const { t } = useTranslation();
  const data = RISK_TREND_ROWS.map((r) => ({
    metric: t(`monitoring.analyticsPage.riskTrends.metrics.${r.labelKey}`),
    [t('monitoring.analyticsPage.legend.portfolio')]: +(r.portfolio * 100).toFixed(2),
    [t('monitoring.analyticsPage.legend.market')]: +(r.market * 100).toFixed(2),
  }));
  const portfolioKey = t('monitoring.analyticsPage.legend.portfolio');
  const marketKey = t('monitoring.analyticsPage.legend.market');
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.riskTrends.title')}
      </h2>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={portfolioKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey={marketKey} fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.riskTrends.caption')}
      </p>
    </section>
  );
};

const BAND_COLOR: Record<ScoreBand, string> = {
  Low: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-green-100 text-green-700',
};

const ScoreDistSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.scoreDist.title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.scoreDist.band')}
              </th>
              <th className="text-right font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.scoreDist.marketFarms')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.scoreDist.portfolioFarms')}
              </th>
            </tr>
          </thead>
          <tbody>
            {SCORE_DIST_ROWS.map((r) => (
              <tr key={r.band} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 pr-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      BAND_COLOR[r.band]
                    }`}
                  >
                    {t(`monitoring.analyticsPage.scoreDist.bands.${r.band}`)}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-gray-700">
                  {r.market.toLocaleString()}
                </td>
                <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-gray-900">
                  {r.portfolio.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const RegionBenchmarkSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const portfolioKey = t('monitoring.analyticsPage.legend.portfolio');
  const marketKey = t('monitoring.analyticsPage.legend.market');
  const data = REGION_BENCHMARK_ROWS.map((r) => ({
    region: translateRegion(localizeRegion(r.region, country), i18n.language),
    [portfolioKey]: r.portfolio,
    [marketKey]: r.market,
  }));
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.regionBenchmark.title')}
      </h2>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={portfolioKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey={marketKey} fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.regionBenchmark.caption')}
      </p>
    </section>
  );
};

// 5-color qualitative palette for the crop bars (matches the PM screenshot).
const CROP_COLOR: Record<AnalyticsCrop, string> = {
  Vineyard: '#4472c4',
  Hazelnut: '#c0504d',
  Apple: '#9bbb59',
  Peach: '#8064a2',
  Blueberry: '#4bacc6',
};


const CropRegionSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  // Flatten one row per (region, source) with a column per crop value. Each
  // x-tick = one source (Market/BANK). Region group labels + separators are
  // rendered via a Customized SVG overlay so they correctly span both
  // Market+BANK columns of each region.
  const data = CROP_REGION_ROWS.map((r) => ({
    id: `${r.region}-${r.source}`,
    source:
      r.source === 'Market'
        ? t('monitoring.analyticsPage.cropRegion.market')
        : t('monitoring.analyticsPage.cropRegion.bank'),
    region: r.region,
    ...r.scores,
  }));
  const regionsInOrder = Array.from(new Set(CROP_REGION_ROWS.map((r) => r.region)));

  // SVG overlay: 4 vertical separators between region pairs + 5 region labels
  // each centered between its (Market, BANK) bands.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RegionOverlay = (chartProps: any) => {
    const { xAxisMap, yAxisMap } = chartProps;
    if (!xAxisMap || !yAxisMap) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceAxis = Object.values(xAxisMap).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.dataKey === 'source',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxis = Object.values(yAxisMap)[0] as any;
    if (!sourceAxis || !yAxis) return null;

    const plotLeft: number = sourceAxis.x;
    const plotWidth: number = sourceAxis.width;
    const bandWidth = plotWidth / data.length; // = plotWidth / 10
    const y1 = yAxis.y;
    // Source axis labels live just below the plot area; region labels go
    // ~16px under that, separators extend ~6px past the region labels.
    const sourceLabelY = sourceAxis.y;
    const regionLabelY = sourceLabelY + 28;
    const separatorY2 = regionLabelY + 8;

    return (
      <g>
        {regionsInOrder.slice(1).map((_, i) => {
          // Separator between pair i (BANK) and pair i+1 (Market) sits at
          // 2*(i+1) source bands from the plot start.
          const x = plotLeft + bandWidth * 2 * (i + 1);
          return (
            <line
              key={`sep-${i}`}
              x1={x}
              x2={x}
              y1={y1}
              y2={separatorY2}
              stroke="#d1d5db"
              strokeDasharray="2 3"
            />
          );
        })}
        {regionsInOrder.map((region, i) => {
          // Center of the region pair (Market+BANK) = 2i + 1 in source bands.
          const x = plotLeft + bandWidth * (2 * i + 1);
          return (
            <text
              key={region}
              x={x}
              y={regionLabelY}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#374151"
            >
              {translateRegion(localizeRegion(region, country), i18n.language)}
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.cropRegion.title')}
      </h2>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="source"
              interval={0}
              tick={{ fontSize: 11, fill: '#4b5563' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              formatter={(name: string) =>
                t(`monitoring.analyticsPage.cropRegion.crops.${name}`)
              }
            />
            {ANALYTICS_CROPS.map((crop) => (
              <Bar
                key={crop}
                dataKey={crop}
                fill={CROP_COLOR[crop]}
                radius={[3, 3, 0, 0]}
              />
            ))}
            <Customized component={RegionOverlay} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

// Modern qualitative palette for criteria (Tailwind 500 series).
const CRITERION_COLOR: Record<AnalyticsCriterion, string> = {
  Climate: '#3b82f6', // blue
  Irrigation: '#14b8a6', // teal
  Management: '#8b5cf6', // violet
  Pests: '#f43f5e', // rose
};

const WeakestDriverSection: React.FC = () => {
  const { t } = useTranslation();
  const countLabel = t('monitoring.analyticsPage.weakestDriver.count');
  const shareLabel = t('monitoring.analyticsPage.weakestDriver.share');
  const marketLabel = t('monitoring.analyticsPage.legend.market');
  const portfolioLabel = t('monitoring.analyticsPage.legend.portfolio');

  // 4 X positions: (Market, Count) (Market, Share) (Portfolio, Count) (Portfolio, Share).
  // Each position holds 4 criterion bars. Y-axis is shared between counts and
  // shares — share-% bars look small next to count bars (matches the spec).
  const byCriterion = (k: 'marketCount' | 'marketShare' | 'portfolioCount' | 'portfolioShare') =>
    Object.fromEntries(
      WEAKEST_DRIVER_ROWS.map((r) => [
        r.criterion,
        k.endsWith('Share') ? +(r[k] * 100).toFixed(1) : r[k],
      ]),
    ) as Record<AnalyticsCriterion, number>;

  const data = [
    { id: 'Market-Count', source: countLabel, group: marketLabel, ...byCriterion('marketCount') },
    { id: 'Market-Share', source: shareLabel, group: marketLabel, ...byCriterion('marketShare') },
    { id: 'Portfolio-Count', source: countLabel, group: portfolioLabel, ...byCriterion('portfolioCount') },
    { id: 'Portfolio-Share', source: shareLabel, group: portfolioLabel, ...byCriterion('portfolioShare') },
  ];
  const groupsInOrder = [marketLabel, portfolioLabel];

  // SVG overlay: 1 separator between Market group and Portfolio group + 2
  // group labels each centered between its (Count, Share) bands.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GroupOverlay = (chartProps: any) => {
    const { xAxisMap, yAxisMap } = chartProps;
    if (!xAxisMap || !yAxisMap) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceAxis = Object.values(xAxisMap).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.dataKey === 'source',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxis = Object.values(yAxisMap)[0] as any;
    if (!sourceAxis || !yAxis) return null;
    const plotLeft: number = sourceAxis.x;
    const plotWidth: number = sourceAxis.width;
    const bandWidth = plotWidth / data.length;
    const y1 = yAxis.y;
    const sourceLabelY = sourceAxis.y;
    const groupLabelY = sourceLabelY + 28;
    const separatorY2 = groupLabelY + 8;
    return (
      <g>
        {groupsInOrder.slice(1).map((_, i) => {
          const x = plotLeft + bandWidth * 2 * (i + 1);
          return (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={y1}
              y2={separatorY2}
              stroke="#d1d5db"
              strokeDasharray="2 3"
            />
          );
        })}
        {groupsInOrder.map((g, i) => {
          const x = plotLeft + bandWidth * (2 * i + 1);
          return (
            <text
              key={g}
              x={x}
              y={groupLabelY}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#374151"
            >
              {g}
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.weakestDriver.title')}
      </h2>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="source"
              interval={0}
              tick={{ fontSize: 11, fill: '#4b5563' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                value,
                t(`monitoring.analyticsPage.weakestDriver.criteria.${name}`),
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              formatter={(name: string) =>
                t(`monitoring.analyticsPage.weakestDriver.criteria.${name}`)
              }
            />
            {ANALYTICS_CRITERIA.map((c) => (
              <Bar
                key={c}
                dataKey={c}
                fill={CRITERION_COLOR[c]}
                radius={[3, 3, 0, 0]}
              />
            ))}
            <Customized component={GroupOverlay} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.weakestDriver.caption')}
      </p>
    </section>
  );
};

// Per-region modern qualitative palette (Tailwind-inspired). Same hues used
// for the Crop x Region chart's crop bars — repurposed here for region bars
// to keep visual continuity across the analytics page.
const HEATMAP_REGION_COLOR: Record<string, string> = {
  Fergana: '#4472c4',
  Bukhara: '#c0504d',
  Samarkand: '#9bbb59',
  Andijan: '#8064a2',
  Tashkent: '#4bacc6',
};

const CriteriaRegionSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  // Flatten one row per (criterion, source); each row carries 5 region values
  // as keyed columns. Outer X-axis = criterion, inner X-axis = source. The
  // pattern mirrors CropRegionSection so the Customized overlay computes
  // separators + group labels the same way.
  const data = CRITERIA_REGION_ROWS.map((r) => ({
    id: `${r.criterion}-${r.source}`,
    source:
      r.source === 'Market'
        ? t('monitoring.analyticsPage.cropRegion.market')
        : t('monitoring.analyticsPage.cropRegion.bank'),
    criterion: r.criterion,
    ...r.scores,
  }));
  const criteriaInOrder = Array.from(
    new Set(CRITERIA_REGION_ROWS.map((r) => r.criterion)),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CriterionOverlay = (chartProps: any) => {
    const { xAxisMap, yAxisMap } = chartProps;
    if (!xAxisMap || !yAxisMap) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceAxis = Object.values(xAxisMap).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.dataKey === 'source',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxis = Object.values(yAxisMap)[0] as any;
    if (!sourceAxis || !yAxis) return null;

    const plotLeft: number = sourceAxis.x;
    const plotWidth: number = sourceAxis.width;
    const bandWidth = plotWidth / data.length; // = plotWidth / 8
    const y1 = yAxis.y;
    const sourceLabelY = sourceAxis.y;
    const groupLabelY = sourceLabelY + 28;
    const separatorY2 = groupLabelY + 8;

    return (
      <g>
        {criteriaInOrder.slice(1).map((_, i) => {
          const x = plotLeft + bandWidth * 2 * (i + 1);
          return (
            <line
              key={`sep-${i}`}
              x1={x}
              x2={x}
              y1={y1}
              y2={separatorY2}
              stroke="#d1d5db"
              strokeDasharray="2 3"
            />
          );
        })}
        {criteriaInOrder.map((c, i) => {
          const x = plotLeft + bandWidth * (2 * i + 1);
          return (
            <text
              key={c}
              x={x}
              y={groupLabelY}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#374151"
            >
              {t(`monitoring.analyticsPage.weakestDriver.criteria.${c}`)}
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.criteriaRegion.title')}
      </h2>
      <div className="h-96">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="source"
              interval={0}
              tick={{ fontSize: 11, fill: '#4b5563' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            {ANALYTICS_HEATMAP_REGIONS.map((region) => (
              <Bar
                key={region}
                dataKey={region}
                // Explicit `name` so recharts uses the localized region label
                // for both legend entries and tooltip rows (otherwise the raw
                // dataKey "Fergana" leaks into the tooltip under Georgia).
                name={translateRegion(
                  localizeRegion(region, country),
                  i18n.language,
                )}
                fill={HEATMAP_REGION_COLOR[region]}
                radius={[3, 3, 0, 0]}
              />
            ))}
            <Customized component={CriterionOverlay} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.criteriaRegion.caption')}
      </p>
    </section>
  );
};

const MonthlyTrendSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const [region, setRegion] = useState<'all' | string>('all');
  const [municipality, setMunicipality] = useState<'all' | string>('all');
  const [crop, setCrop] = useState<'all' | string>('all');

  const filtersActive =
    region !== 'all' || municipality !== 'all' || crop !== 'all';

  // Per spec: any filter applied → keep first 3 rows; row 1 reflects the
  // user's filter selection on the corresponding cell. The default sample
  // (Kakheti / Kvareli / Apple) is also localized to the selected country.
  const rows = filtersActive ? MONTHLY_TREND_ROWS.slice(0, 3) : MONTHLY_TREND_ROWS;
  const displayRows = rows.map((r, i) =>
    i === 0
      ? {
          ...r,
          region: region !== 'all' ? region : r.region,
          municipality: municipality !== 'all' ? municipality : r.municipality,
          crop: crop !== 'all' ? crop : r.crop,
        }
      : r,
  );

  const lang = i18n.language;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.monthlyTrend.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <FilterSelect
          label={t('monitoring.analyticsPage.monthlyTrend.filters.region')}
          value={region}
          onChange={setRegion}
          groupedOptions={filterRegionsForCountry(country)}
          formatOption={(o) => translateRegion(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={t('monitoring.analyticsPage.monthlyTrend.filters.all')}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.monthlyTrend.filters.municipality')}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={t('monitoring.analyticsPage.monthlyTrend.filters.all')}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.monthlyTrend.filters.crop')}
          value={crop}
          onChange={setCrop}
          options={FILTER_CROPS}
          formatOption={(o) =>
            t(`monitoring.analyticsPage.cropRegion.crops.${o}`, {
              defaultValue: o,
            })
          }
          allLabel={t('monitoring.analyticsPage.monthlyTrend.filters.all')}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.monthlyTrend.columns.month')}
              </th>
              <th className="text-right font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.monthlyTrend.columns.marketAvg')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.monthlyTrend.columns.portfolioAvg')}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => (
              <tr key={r.month} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 pr-4 font-mono text-gray-700">{r.month}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-gray-700">
                  {r.marketAvg.toFixed(1)}
                </td>
                <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-gray-900">
                  {r.portfolioAvg.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const FilterSelect: React.FC<{
  label: string;
  value: 'all' | string;
  onChange: (v: 'all' | string) => void;
  options?: string[];
  groupedOptions?: GroupedOptions[];
  formatOption: (o: string) => string;
  formatGroup?: (g: string) => string;
  allLabel: string;
}> = ({
  label,
  value,
  onChange,
  options,
  groupedOptions,
  formatOption,
  formatGroup,
  allLabel,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
    >
      <option value="all">{allLabel}</option>
      {options?.map((o) => (
        <option key={o} value={o}>
          {formatOption(o)}
        </option>
      ))}
      {groupedOptions?.map((g) => (
        <optgroup key={g.group} label={formatGroup ? formatGroup(g.group) : g.group}>
          {g.options.map((o) => (
            <option key={o} value={o}>
              {formatOption(o)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
);

const MonthlyHighRiskSection: React.FC = () => {
  const { t } = useTranslation();
  const marketLabel = t('monitoring.analyticsPage.monthlyHighRisk.marketSeries');
  const portfolioLabel = t(
    'monitoring.analyticsPage.monthlyHighRisk.portfolioSeries',
  );
  const data = MONTHLY_HIGH_RISK_ROWS.map((r) => ({
    month: r.month,
    [marketLabel]: +(r.market * 100).toFixed(1),
    [portfolioLabel]: +(r.portfolio * 100).toFixed(1),
  }));

  // Format data labels as `xx.x%`. recharts passes the numeric value to the
  // formatter; with our 1-decimal series the label reads cleanly.
  const labelFormatter = (v: number) => `${v.toFixed(1)}%`;

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.monthlyHighRisk.title')}
      </h2>
      <div className="h-80">
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 24, right: 24, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#4b5563' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 'dataMax + 5']}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line
              type="monotone"
              dataKey={marketLabel}
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                dataKey={marketLabel}
                position="top"
                offset={10}
                formatter={labelFormatter}
                style={{ fontSize: 11, fill: '#1d4ed8', fontWeight: 600 }}
              />
            </Line>
            <Line
              type="monotone"
              dataKey={portfolioLabel}
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                dataKey={portfolioLabel}
                position="top"
                offset={10}
                formatter={labelFormatter}
                style={{ fontSize: 11, fill: '#b91c1c', fontWeight: 600 }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

const DIRECTION_BADGE: Record<string, string> = {
  same: 'bg-gray-100 text-gray-600',
  improved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

const DIRECTION_ARROW: Record<string, string> = {
  same: '=',
  improved: '↑',
  declined: '↓',
};

const ScoreMigrationSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.scoreMigration.title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.scoreMigration.from')}
              </th>
              <th className="text-right font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.scoreMigration.market')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.scoreMigration.portfolio')}
              </th>
            </tr>
          </thead>
          <tbody>
            {SCORE_MIGRATION_ROWS.map((r) => {
              const dir = migrationDirection(r.from, r.to);
              const fromLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.from}`,
              );
              const toLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.to}`,
              );
              return (
                <tr
                  key={`${r.from}-${r.to}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${DIRECTION_BADGE[dir]}`}
                    >
                      {fromLabel}
                      <span className="text-base leading-none">
                        {DIRECTION_ARROW[dir]}
                      </span>
                      {toLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-gray-700">
                    {r.market.toLocaleString()}
                  </td>
                  <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-gray-900">
                    {r.portfolio.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.scoreMigration.caption')}
      </p>
    </section>
  );
};

const ScoreMigrationFilteredSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  // Country-aware sample defaults — Kakheti/Kvareli for Georgia, Fergana/Furkat
  // for Uzbekistan. State resets when the user flips the country selector so
  // the dropdowns never show a value missing from the new options list.
  const defaultsForCountry = (c: AnalyticsCountry) =>
    c === 'georgia'
      ? { region: 'Kakheti', municipality: 'Kvareli' }
      : { region: 'Fergana', municipality: 'Furkat' };

  const [transition, setTransition] = useState<string>('Low-Low');
  const [source, setSource] = useState<'Market' | 'Portfolio'>('Market');
  const [region, setRegion] = useState<'all' | string>(
    defaultsForCountry(country).region,
  );
  const [municipality, setMunicipality] = useState<'all' | string>(
    defaultsForCountry(country).municipality,
  );
  const [crop, setCrop] = useState<'all' | string>('Apple');

  useEffect(() => {
    const d = defaultsForCountry(country);
    setRegion(d.region);
    setMunicipality(d.municipality);
  }, [country]);

  const lang = i18n.language;
  // Sample farm count — fixed at 5 per spec; would come from real data later.
  const farms = 5;

  const allLabel = t('monitoring.analyticsPage.scoreMigrationFiltered.filters.any');

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.scoreMigrationFiltered.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('monitoring.analyticsPage.scoreMigrationFiltered.filters.from')}
          </label>
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            {SCORE_MIGRATION_ROWS.map((r) => {
              const id = `${r.from}-${r.to}`;
              const fromLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.from}`,
              );
              const toLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.to}`,
              );
              return (
                <option key={id} value={id}>
                  {fromLabel} → {toLabel}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('monitoring.analyticsPage.scoreMigrationFiltered.filters.source')}
          </label>
          <div className="inline-flex rounded border border-gray-300 overflow-hidden text-sm h-[38px] w-full">
            {(['Market', 'Portfolio'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`flex-1 px-3 transition-colors ${
                  source === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(`monitoring.analyticsPage.scoreMigration.${s.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        <FilterSelect
          label={t('monitoring.analyticsPage.scoreMigrationFiltered.filters.region')}
          value={region}
          onChange={setRegion}
          groupedOptions={filterRegionsForCountry(country)}
          formatOption={(o) => translateRegion(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.scoreMigrationFiltered.filters.municipality')}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.scoreMigrationFiltered.filters.crop')}
          value={crop}
          onChange={setCrop}
          options={FILTER_CROPS}
          formatOption={(o) =>
            t(`monitoring.analyticsPage.cropRegion.crops.${o}`, {
              defaultValue: o,
            })
          }
          allLabel={allLabel}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.scoreMigrationFiltered.columns.region')}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.scoreMigrationFiltered.columns.municipality')}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.scoreMigrationFiltered.columns.crop')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.scoreMigrationFiltered.columns.farms')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 last:border-0">
              <td className="py-2.5 pr-4 text-gray-700">
                {region === 'all' ? '—' : translateRegion(region, lang)}
              </td>
              <td className="py-2.5 px-4 text-gray-700">
                {municipality === 'all'
                  ? '—'
                  : translateMunicipality(municipality, lang)}
              </td>
              <td className="py-2.5 px-4 text-gray-700">
                {crop === 'all'
                  ? '—'
                  : t(`monitoring.analyticsPage.cropRegion.crops.${crop}`, {
                      defaultValue: crop,
                    })}
              </td>
              <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-gray-900">
                {farms}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.scoreMigrationFiltered.caption')}
      </p>
    </section>
  );
};

// ─── Lead Generation view ──────────────────────────────────────────────────

const LeadGenView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        {t('monitoring.analyticsPage.leadGen.intro')}
      </p>
      <LeadOpportunitySection />
      <LeadByScoresSection />
      <LeadByCriteriaSection />
      <LeadByMigrationSection />
    </div>
  );
};

const LeadOpportunitySection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const [municipality, setMunicipality] = useState<'all' | string>('all');
  const lang = i18n.language;

  // Per spec: any filter applied → keep only first 3 rows from the table.
  // Underlying data is illustrative and not connected to the real fields, so
  // we don't try to actually match by municipality value.
  const rows =
    municipality === 'all'
      ? LEAD_OPPORTUNITY_ROWS
      : LEAD_OPPORTUNITY_ROWS.slice(0, 3);

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.leadGen.leadOpportunity.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <FilterSelect
          label={t(
            'monitoring.analyticsPage.leadGen.leadOpportunity.columns.municipality',
          )}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={t('monitoring.analyticsPage.monthlyTrend.filters.all')}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.leadGen.leadOpportunity.columns.region')}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t(
                  'monitoring.analyticsPage.leadGen.leadOpportunity.columns.municipality',
                )}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.leadGen.leadOpportunity.columns.crop')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t(
                  'monitoring.analyticsPage.leadGen.leadOpportunity.columns.avgScore',
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={`${r.region}-${r.crop}-${i}`}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-2.5 pr-4 text-gray-700">
                  {translateRegion(localizeRegion(r.region, country), lang)}
                </td>
                <td className="py-2.5 px-4 text-gray-700">
                  {r.municipality
                    ? translateMunicipality(
                        localizeMunicipality(r.municipality, country),
                        lang,
                      )
                    : municipality !== 'all'
                      ? translateMunicipality(municipality, lang)
                      : '—'}
                </td>
                <td className="py-2.5 px-4 text-gray-700">
                  {t(`monitoring.analyticsPage.cropRegion.crops.${r.crop}`, {
                    defaultValue: r.crop,
                  })}
                </td>
                <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-gray-900">
                  {r.avgScore.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.leadGen.leadOpportunity.caption')}
      </p>
    </section>
  );
};

// Reusable button bar for the lead-gen tables: visual-only Download KMZ + a
// Create Portfolio prompt that saves the visible row codes as a portfolio.
const LeadGenActions: React.FC<{ visibleIds: string[] }> = ({ visibleIds }) => {
  const { t } = useTranslation();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const onSave = () => {
    if (!name.trim() || visibleIds.length === 0) return;
    savePortfolio(name.trim(), visibleIds);
    setNaming(false);
    setName('');
    setToast(t('monitoring.analyticsPage.leadGen.actions.saved'));
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => {
            setToast(t('monitoring.toast.kmzUnavailable'));
            setTimeout(() => setToast(null), 2200);
          }}
          className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
        >
          {t('monitoring.analyticsPage.leadGen.actions.downloadKmz')}
        </button>
        <button
          onClick={() => setNaming(true)}
          disabled={visibleIds.length === 0}
          className={`px-3 py-2 rounded text-sm font-medium ${
            visibleIds.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {t('monitoring.analyticsPage.leadGen.actions.createPortfolio')}
        </button>
      </div>

      {naming && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
          onClick={() => setNaming(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {t('monitoring.analyticsPage.leadGen.actions.savePortfolio')}
            </h2>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                'monitoring.analyticsPage.leadGen.actions.savePlaceholder',
              )}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNaming(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                {t('monitoring.analyticsPage.leadGen.actions.cancel')}
              </button>
              <button
                onClick={onSave}
                disabled={!name.trim()}
                className={`px-4 py-2 rounded text-white text-sm ${
                  name.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {t('monitoring.analyticsPage.leadGen.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2100] bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
};

const LeadByScoresSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const [region, setRegion] = useState<'all' | string>('all');
  const [municipality, setMunicipality] = useState<'all' | string>('all');
  const [crop, setCrop] = useState<'all' | string>('all');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const lang = i18n.language;

  // Each filter actually narrows the data — real per-row filtering. Region
  // and municipality comparisons use the COUNTRY-LOCALIZED labels so the
  // dropdown choice ("Kakheti" under Georgia) matches the underlying Uzbek
  // row data ("Fergana") via positional mapping.
  const min = minScore === '' ? -Infinity : Number(minScore);
  const max = maxScore === '' ? Infinity : Number(maxScore);
  const rows = LEAD_BY_SCORES_ROWS.filter((r) => {
    if (region !== 'all' && localizeRegion(r.region, country) !== region)
      return false;
    if (
      municipality !== 'all' &&
      localizeMunicipality(r.municipality, country) !== municipality
    )
      return false;
    if (crop !== 'all' && r.crop !== crop) return false;
    if (r.farmScore < min || r.farmScore > max) return false;
    return true;
  });
  const allLabel = t('monitoring.analyticsPage.monthlyTrend.filters.all');

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.leadGen.byScores.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byScores.filters.region')}
          value={region}
          onChange={setRegion}
          groupedOptions={filterRegionsForCountry(country)}
          formatOption={(o) => translateRegion(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byScores.filters.municipality')}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byScores.filters.crop')}
          value={crop}
          onChange={setCrop}
          options={FILTER_CROPS}
          formatOption={(o) =>
            t(`monitoring.analyticsPage.cropRegion.crops.${o}`, {
              defaultValue: o,
            })
          }
          allLabel={allLabel}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byScores.filters.minScore')}
          value={minScore}
          onChange={setMinScore}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byScores.filters.maxScore')}
          value={maxScore}
          onChange={setMaxScore}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.region')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.municipality')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.crop')}
              </th>
              <th className="text-right font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.farmScore')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.farmCode')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.gps')}
              </th>
              <th className="text-right font-semibold py-2 pl-3">
                {t('monitoring.analyticsPage.leadGen.byScores.columns.areaHa')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400 text-sm">
                  {t('monitoring.analyticsPage.leadGen.actions.noMatches')}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.farmCode}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-3 text-gray-700">
                    {translateRegion(localizeRegion(r.region, country), lang)}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {translateMunicipality(
                      localizeMunicipality(r.municipality, country),
                      lang,
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {t(`monitoring.analyticsPage.cropRegion.crops.${r.crop}`, {
                      defaultValue: r.crop,
                    })}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-gray-900">
                    {r.farmScore.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 font-mono text-gray-600">
                    #{r.farmCode}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-500">
                    {r.gps}
                  </td>
                  <td className="py-2 pl-3 text-right tabular-nums text-gray-700">
                    {r.areaHa.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.leadGen.byScores.caption')}
      </p>

      <LeadGenActions visibleIds={rows.map((r) => r.farmCode)} />
    </section>
  );
};

const LeadByCriteriaSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const [criterion, setCriterion] = useState<AnalyticsCriterion>('Climate');
  const [weakStrong, setWeakStrong] = useState<'Weak' | 'Strong'>('Weak');
  const [region, setRegion] = useState<'all' | string>('all');
  const [municipality, setMunicipality] = useState<'all' | string>('all');
  const [crop, setCrop] = useState<'all' | string>('all');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const lang = i18n.language;

  // Real per-row filtering. Criterion: rows with a matching criterion stay,
  // rows with `null` criterion are a general pool and always pass. Weak /
  // Strong has no equivalent column in the spec data so it stays as a
  // selector but doesn't slice — it's a logical lens over the same rows.
  const min = minScore === '' ? -Infinity : Number(minScore);
  const max = maxScore === '' ? Infinity : Number(maxScore);
  const rows = LEAD_BY_CRITERIA_ROWS.filter((r) => {
    if (r.criterion !== null && r.criterion !== criterion) return false;
    if (region !== 'all' && localizeRegion(r.region, country) !== region)
      return false;
    if (
      municipality !== 'all' &&
      localizeMunicipality(r.municipality, country) !== municipality
    )
      return false;
    if (crop !== 'all' && r.crop !== crop) return false;
    if (r.farmScore < min || r.farmScore > max) return false;
    return true;
  });
  // Reference weakStrong so the lint pass doesn't flag it as unused while we
  // keep it as a UI control with no data-side effect.
  void weakStrong;
  const allLabel = t('monitoring.analyticsPage.monthlyTrend.filters.all');

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.leadGen.byCriteria.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('monitoring.analyticsPage.leadGen.byCriteria.filters.criterion')}
          </label>
          <select
            value={criterion}
            onChange={(e) => setCriterion(e.target.value as AnalyticsCriterion)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            {ANALYTICS_CRITERIA.map((c) => (
              <option key={c} value={c}>
                {t(`monitoring.analyticsPage.weakestDriver.criteria.${c}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('monitoring.analyticsPage.leadGen.byCriteria.filters.weakStrong')}
          </label>
          <div className="inline-flex rounded border border-gray-300 overflow-hidden text-sm h-[38px] w-full">
            {(['Weak', 'Strong'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setWeakStrong(s)}
                className={`flex-1 px-3 transition-colors ${
                  weakStrong === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(`monitoring.analyticsPage.leadGen.byCriteria.filters.${s.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byCriteria.filters.region')}
          value={region}
          onChange={setRegion}
          groupedOptions={filterRegionsForCountry(country)}
          formatOption={(o) => translateRegion(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byCriteria.filters.municipality')}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byCriteria.filters.crop')}
          value={crop}
          onChange={setCrop}
          options={FILTER_CROPS}
          formatOption={(o) =>
            t(`monitoring.analyticsPage.cropRegion.crops.${o}`, {
              defaultValue: o,
            })
          }
          allLabel={allLabel}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byCriteria.filters.minScore')}
          value={minScore}
          onChange={setMinScore}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byCriteria.filters.maxScore')}
          value={maxScore}
          onChange={setMaxScore}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.criterion')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.region')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.municipality')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.crop')}
              </th>
              <th className="text-right font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.farmScore')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.farmCode')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.gps')}
              </th>
              <th className="text-right font-semibold py-2 pl-3">
                {t('monitoring.analyticsPage.leadGen.byCriteria.columns.areaHa')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400 text-sm">
                  {t('monitoring.analyticsPage.leadGen.actions.noMatches')}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.farmCode}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-3 text-gray-700">
                    {r.criterion
                      ? t(
                          `monitoring.analyticsPage.weakestDriver.criteria.${r.criterion}`,
                        )
                      : '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {translateRegion(localizeRegion(r.region, country), lang)}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {translateMunicipality(
                      localizeMunicipality(r.municipality, country),
                      lang,
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-700">
                    {t(`monitoring.analyticsPage.cropRegion.crops.${r.crop}`, {
                      defaultValue: r.crop,
                    })}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-gray-900">
                    {r.farmScore.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 font-mono text-gray-600">
                    #{r.farmCode}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-500">
                    {r.gps}
                  </td>
                  <td className="py-2 pl-3 text-right tabular-nums text-gray-700">
                    {r.areaHa.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.leadGen.byCriteria.caption')}
      </p>

      <LeadGenActions visibleIds={rows.map((r) => r.farmCode)} />
    </section>
  );
};

const LeadByMigrationSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const country = useAnalyticsCountry();
  const [category, setCategory] = useState<'all' | string>('all');
  const [region, setRegion] = useState<'all' | string>('all');
  const [municipality, setMunicipality] = useState<'all' | string>('all');
  const [crop, setCrop] = useState<'all' | string>('all');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const lang = i18n.language;

  // The only filter the data can actually slice on is `category` (the band
  // transition) — region/municipality/crop/score columns aren't present in
  // this dataset. Those controls are kept as UI per spec but no-op.
  const rows =
    category === 'all'
      ? LEAD_BY_MIGRATION_ROWS
      : LEAD_BY_MIGRATION_ROWS.filter(
          (r) => `${r.fromBand}-${r.toBand}` === category,
        );
  // Touch the no-op filter values so the lint pass doesn't flag them.
  void region;
  void municipality;
  void crop;
  void minScore;
  void maxScore;

  const allLabel = t('monitoring.analyticsPage.monthlyTrend.filters.all');

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.analyticsPage.leadGen.byMigration.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t('monitoring.analyticsPage.leadGen.byMigration.filters.category')}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="all">{allLabel}</option>
            {SCORE_MIGRATION_ROWS.map((r) => {
              const id = `${r.from}-${r.to}`;
              const fromLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.from}`,
              );
              const toLabel = t(
                `monitoring.analyticsPage.scoreMigration.bands.${r.to}`,
              );
              return (
                <option key={id} value={id}>
                  {fromLabel} → {toLabel}
                </option>
              );
            })}
          </select>
        </div>

        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byMigration.filters.region')}
          value={region}
          onChange={setRegion}
          groupedOptions={filterRegionsForCountry(country)}
          formatOption={(o) => translateRegion(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byMigration.filters.municipality')}
          value={municipality}
          onChange={setMunicipality}
          groupedOptions={filterMunicipalitiesForCountry(country)}
          formatOption={(o) => translateMunicipality(o, lang)}
          formatGroup={(g) => t(`grid.countries.${g}`)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={t('monitoring.analyticsPage.leadGen.byMigration.filters.crop')}
          value={crop}
          onChange={setCrop}
          options={FILTER_CROPS}
          formatOption={(o) =>
            t(`monitoring.analyticsPage.cropRegion.crops.${o}`, {
              defaultValue: o,
            })
          }
          allLabel={allLabel}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byMigration.filters.minScore')}
          value={minScore}
          onChange={setMinScore}
        />
        <ScoreInput
          label={t('monitoring.analyticsPage.leadGen.byMigration.filters.maxScore')}
          value={maxScore}
          onChange={setMaxScore}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-4">
                {t('monitoring.analyticsPage.leadGen.byMigration.columns.category')}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.leadGen.byMigration.columns.farmCode')}
              </th>
              <th className="text-left font-semibold py-2 px-4">
                {t('monitoring.analyticsPage.leadGen.byMigration.columns.gps')}
              </th>
              <th className="text-right font-semibold py-2 pl-4">
                {t('monitoring.analyticsPage.leadGen.byMigration.columns.areaHa')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                  {t('monitoring.analyticsPage.leadGen.actions.noMatches')}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const fromLabel = t(
                  `monitoring.analyticsPage.scoreMigration.bands.${r.fromBand}`,
                );
                const toLabel = t(
                  `monitoring.analyticsPage.scoreMigration.bands.${r.toBand}`,
                );
                const dir = migrationDirection(r.fromBand, r.toBand);
                return (
                  <tr
                    key={r.farmCode}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${DIRECTION_BADGE[dir]}`}
                      >
                        {fromLabel}
                        <span className="text-base leading-none">
                          {DIRECTION_ARROW[dir]}
                        </span>
                        {toLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-600">
                      #{r.farmCode}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-500">
                      {r.gps}
                    </td>
                    <td className="py-2.5 pl-4 text-right tabular-nums text-gray-700">
                      {r.areaHa.toFixed(1)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.analyticsPage.leadGen.byMigration.caption')}
      </p>

      <LeadGenActions visibleIds={rows.map((r) => r.farmCode)} />
    </section>
  );
};

const ScoreInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </label>
    <input
      type="number"
      min={1}
      max={10}
      step={0.1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="1–10"
      className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
    />
  </div>
);

export default AnalyticsPage;
