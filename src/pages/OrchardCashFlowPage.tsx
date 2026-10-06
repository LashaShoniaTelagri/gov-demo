import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ANNUAL_CASHFLOW_USD_ROWS,
  DIRECT_COSTS_ROWS,
  DIRECT_COSTS_TOTALS,
  MONTHS_ROMAN,
  REALISTIC_PROFIT,
  REGIONAL_LOAN_ROWS,
  REVENUE_SCENARIOS,
  SEASONAL_LOAN_ROWS,
} from '../lib/cashFlowData';

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const;

// Render a GEL cell — zero is shown as "—" for readability per the PRD's
// General UI Requirements (consistent zero treatment across all tables).
const gelCell = (n: number): React.ReactNode =>
  n === 0 ? '—' : n.toLocaleString();

// Signed cell used by the cash-flow tables. Negative values render in red
// per the General UI Requirements; zero → "—"; positive → normal.
const signedCell = (n: number): React.ReactNode => {
  if (n === 0) return <span className="text-gray-400">—</span>;
  if (n < 0)
    return <span className="text-red-600">{n.toLocaleString()}</span>;
  return n.toLocaleString();
};

// Language switcher reuses the same shape as AnalyticsPage / MonitoringPage.
const CASH_FLOW_LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const OrchardCashFlowPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang =
    CASH_FLOW_LANGUAGES.find((l) => l.code === i18n.language) ??
    CASH_FLOW_LANGUAGES[1];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/monitoring')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← {t('monitoring.cashFlow.back')}
          </button>
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
                  {CASH_FLOW_LANGUAGES.map((lang) => (
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

        <header className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {t('monitoring.cashFlow.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('monitoring.cashFlow.subtitle')}
          </p>
        </header>

        <AnnualCashFlowSection />
        <DirectCostsSection />
        <YieldAndProfitSection />
        <RevenueScenarioSection />
        <SeasonalLoansSection />
        <RegionalLoansSection />
      </div>
    </div>
  );
};

const RegionalLoansSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.cashFlow.regionalLoans.title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-3">
                {t('monitoring.cashFlow.regionalLoans.columns.activity')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.cashFlow.regionalLoans.columns.region')}
              </th>
              <th className="text-left font-semibold py-2 px-3">
                {t('monitoring.cashFlow.regionalLoans.columns.period')}
              </th>
              <th className="text-right font-semibold py-2 pl-3">
                {t('monitoring.cashFlow.regionalLoans.columns.totalPortfolio')}
              </th>
            </tr>
          </thead>
          <tbody>
            {REGIONAL_LOAN_ROWS.map((r) => (
              <tr
                key={r.activityKey}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-2.5 pr-3 text-gray-800 font-medium">
                  {t(
                    `monitoring.cashFlow.seasonalLoans.activities.${r.activityKey}`,
                  )}
                </td>
                <td className="py-2.5 px-3 text-gray-700">{r.region}</td>
                <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">
                  {t(
                    `monitoring.cashFlow.seasonalLoans.periods.${r.periodKey}`,
                  )}
                </td>
                <td className="py-2.5 pl-3 text-right tabular-nums text-emerald-700 font-bold">
                  ${r.totalPortfolioSizeUsd.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic">
        {t('monitoring.cashFlow.regionalLoans.caption')}
      </p>
    </section>
  );
};

const SeasonalLoansSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('monitoring.cashFlow.seasonalLoans.title')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left font-semibold py-2 pr-3">
                  {t('monitoring.cashFlow.seasonalLoans.columns.activity')}
                </th>
                <th className="text-left font-semibold py-2 px-3">
                  {t('monitoring.cashFlow.seasonalLoans.columns.period')}
                </th>
                <th className="text-right font-semibold py-2 pl-3">
                  {t('monitoring.cashFlow.seasonalLoans.columns.loanSize')}
                </th>
              </tr>
            </thead>
            <tbody>
              {SEASONAL_LOAN_ROWS.map((r) => (
                <tr
                  key={r.activityKey}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2.5 pr-3 text-gray-800 font-medium">
                    {t(
                      `monitoring.cashFlow.seasonalLoans.activities.${r.activityKey}`,
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">
                    {t(
                      `monitoring.cashFlow.seasonalLoans.periods.${r.periodKey}`,
                    )}
                  </td>
                  <td className="py-2.5 pl-3 text-right tabular-nums text-gray-900 font-semibold">
                    ${r.loanSizeUsd.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 italic">
        {t('monitoring.cashFlow.seasonalLoans.caption')}
      </p>
    </section>
  );
};

const RevenueScenarioSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {t('monitoring.cashFlow.revenueScenario.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVENUE_SCENARIOS.filter((s) => s.id !== 'conservative').map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-xl p-5 ${
              s.isBaseCase
                ? 'border-2 border-emerald-500 shadow-md'
                : 'border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                {t(`monitoring.cashFlow.revenueScenario.scenarios.${s.id}`)}
              </h3>
              {s.isBaseCase && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  {t('monitoring.cashFlow.revenueScenario.baseCase')}
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900 tabular-nums">
                ${s.freeCashUsd.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {t('monitoring.cashFlow.revenueScenario.freeCash')}
              </div>
            </div>

            <dl className="divide-y divide-gray-100 border-t border-gray-100">
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.yieldPerHa')}
                value={`${s.yieldPerHaTonnes} t`}
              />
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.pricePerKg')}
                value={`$${s.pricePerKgUsd.toFixed(2)}`}
              />
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.revenuePerHa')}
                value={`$${s.revenuePerHaUsd.toLocaleString()}`}
              />
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.totalYield')}
                value={`${s.totalYieldTonnes} t`}
              />
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.totalRevenue')}
                value={`$${s.totalRevenueUsd.toLocaleString()}`}
              />
              <ScenarioRow
                label={t('monitoring.cashFlow.revenueScenario.costs')}
                value={`$${s.costsUsd.toLocaleString()}`}
              />
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
};

const ScenarioRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-2.5">
    <dt className="text-sm text-gray-600">{label}</dt>
    <dd className="text-sm font-semibold text-gray-900 tabular-nums">{value}</dd>
  </div>
);

const YieldAndProfitSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.cashFlow.realisticProfit.title')}
      </h2>
      <dl className="divide-y divide-gray-100">
        <ProfitRow
          label={t('monitoring.cashFlow.realisticProfit.farmScore')}
          value={REALISTIC_PROFIT.farmScore.toString()}
        />
        <ProfitRow
          label={t('monitoring.cashFlow.realisticProfit.regionalIndex')}
          value={REALISTIC_PROFIT.regionalIndex.toString()}
        />
        <ProfitRow
          label={t('monitoring.cashFlow.realisticProfit.costVariation')}
          value={REALISTIC_PROFIT.costVariationIndex.toString()}
        />
        <ProfitRow
          label={t('monitoring.cashFlow.realisticProfit.priceVariation')}
          value={REALISTIC_PROFIT.priceVariationIndex.toString()}
        />
      </dl>
    </section>
  );
};

const ProfitRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between py-2.5">
    <dt className="text-sm text-gray-600">{label}</dt>
    <dd className="text-sm font-semibold text-gray-900 tabular-nums">{value}</dd>
  </div>
);

const AnnualCashFlowSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">
        {t('monitoring.cashFlow.annualCashFlow.title')}
      </h2>

      {/* 4 KPI tiles — values per the PRD's Annual Summary screenshot.
          Numbers are USD with `$` prefix; Free cash tile uses emerald
          text to visually mark the net result. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile
          label={t('monitoring.cashFlow.annualCashFlow.tiles.totalIncome')}
          value="$175,000"
          sub={t('monitoring.cashFlow.annualCashFlow.tiles.totalIncomeSub')}
          accent="emerald"
        />
        <SummaryTile
          label={t('monitoring.cashFlow.annualCashFlow.tiles.directCosts')}
          value="$51,055"
          sub={t('monitoring.cashFlow.annualCashFlow.tiles.directCostsSub')}
        />
        <SummaryTile
          label={t('monitoring.cashFlow.annualCashFlow.tiles.mgmtCosts')}
          value="$21,000"
          sub={t('monitoring.cashFlow.annualCashFlow.tiles.mgmtCostsSub')}
        />
        <SummaryTile
          label={t('monitoring.cashFlow.annualCashFlow.tiles.freeCash')}
          value="$102,945"
          sub={t('monitoring.cashFlow.annualCashFlow.tiles.freeCashSub')}
          accent="emerald"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {t('monitoring.cashFlow.annualCashFlow.monthlyTableTitle')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left font-semibold py-2 pr-3 sticky left-0 bg-white">
                  {t('monitoring.cashFlow.annualCashFlow.metric')}
                </th>
                {MONTH_KEYS.map((k) => (
                  <th
                    key={k}
                    className="text-right font-semibold py-2 px-2 font-mono"
                  >
                    {t(`monitoring.cashFlow.paymentSchedule.months.${k}`)}
                  </th>
                ))}
                <th className="text-right font-semibold py-2 pl-3 border-l border-gray-200">
                  {t('monitoring.cashFlow.annualCashFlow.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_CASHFLOW_USD_ROWS.map((r) => {
                const isFreeCash = r.labelKey === 'freeCash';
                return (
                  <tr
                    key={r.labelKey}
                    className={`border-b border-gray-100 last:border-0 ${
                      isFreeCash ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td
                      className={`py-2.5 pr-3 sticky left-0 ${
                        isFreeCash
                          ? 'font-semibold text-gray-900 bg-gray-50'
                          : 'text-gray-700 bg-white'
                      }`}
                    >
                      {t(
                        `monitoring.cashFlow.annualCashFlow.rows.${r.labelKey}`,
                      )}
                    </td>
                    {r.monthly.map((v, i) => (
                      <td
                        key={i}
                        className={`py-2.5 px-2 text-right tabular-nums ${
                          isFreeCash ? 'font-semibold' : ''
                        }`}
                      >
                        {signedCell(v)}
                      </td>
                    ))}
                    <td
                      className={`py-2.5 pl-3 text-right tabular-nums border-l border-gray-200 ${
                        isFreeCash
                          ? 'font-bold text-emerald-700'
                          : 'font-semibold text-gray-900'
                      }`}
                    >
                      ${r.total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// Annual Summary KPI tile — `accent="emerald"` paints the value in emerald
// to mark headline metrics (Total income, Free cash).
const SummaryTile: React.FC<{
  label: string;
  value: string;
  sub: string;
  accent?: 'emerald';
}> = ({ label, value, sub, accent }) => (
  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
    <div className="text-xs text-gray-500">{label}</div>
    <div
      className={`text-2xl font-bold mt-1 tabular-nums ${
        accent === 'emerald' ? 'text-emerald-600' : 'text-gray-900'
      }`}
    >
      {value}
    </div>
    <div className="text-xs text-gray-400 mt-1">{sub}</div>
  </div>
);

const DirectCostsSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('monitoring.cashFlow.directCosts.title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold py-2 pr-3 sticky left-0 bg-white">
                {t('monitoring.cashFlow.directCosts.costItem')}
              </th>
              {MONTHS_ROMAN.map((m) => (
                <th
                  key={m}
                  className="text-right font-semibold py-2 px-2 font-mono"
                >
                  {m}
                </th>
              ))}
              <th className="text-right font-semibold py-2 pl-3 border-l border-gray-200">
                {t('monitoring.cashFlow.directCosts.total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {DIRECT_COSTS_ROWS.map((r) => (
              <tr
                key={r.labelKey}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-2 pr-3 text-gray-700 sticky left-0 bg-white">
                  {t(`monitoring.cashFlow.directCosts.items.${r.labelKey}`)}
                </td>
                {r.monthly.map((v, i) => (
                  <td
                    key={i}
                    className="py-2 px-2 text-right tabular-nums text-gray-700"
                  >
                    {gelCell(v)}
                  </td>
                ))}
                <td className="py-2 pl-3 text-right tabular-nums font-semibold text-gray-900 border-l border-gray-200">
                  {r.total.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <td className="py-2.5 pr-3 font-bold text-gray-800 sticky left-0 bg-gray-50">
                {t('monitoring.cashFlow.directCosts.total')}
              </td>
              {DIRECT_COSTS_TOTALS.monthly.map((v, i) => (
                <td
                  key={i}
                  className="py-2.5 px-2 text-right tabular-nums font-semibold text-gray-900"
                >
                  {gelCell(v)}
                </td>
              ))}
              <td className="py-2.5 pl-3 text-right tabular-nums font-bold text-emerald-700 border-l border-gray-200">
                {DIRECT_COSTS_TOTALS.total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrchardCashFlowPage;
