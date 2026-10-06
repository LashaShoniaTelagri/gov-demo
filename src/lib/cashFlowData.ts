// Hardcoded sample data for the Orchard Cash Flow page.
// Source: PM's Excel `ვაშლი_cash_flow.xlsx` exported to `CashFlow_Table.csv`.
// All numbers used verbatim — no recalculation, no aggregation. See PRD
// "Apple Orchard Cash Flow Demo" v1.0 (2026-05-11) for acceptance criteria.

// ─── Shared month column shapes ────────────────────────────────────────────
// GEL tables use Roman numerals; USD tables use full English month names.
export const MONTHS_ROMAN = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
] as const;
export const MONTHS_ENGLISH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

// ─── Direct Costs — CSV rows 2–13 ─────────────────────────────
// `labelKey` resolves against `monitoring.cashFlow.directCosts.items.*`.
// Monthly values index 0..11 align with MONTHS_ROMAN. `total` is taken
// verbatim from the spreadsheet (= sum across months but cached, not
// recomputed, per "data as-is" rule).
export interface DirectCostRow {
  labelKey: string;
  monthly: readonly [number, number, number, number, number, number, number, number, number, number, number, number];
  total: number;
}

export const DIRECT_COSTS_ROWS: DirectCostRow[] = [
  { labelKey: 'mineralFertilizer', monthly: [0, 150, 0, 150, 0, 0, 0, 0, 150, 900, 900, 0], total: 2250 },
  { labelKey: 'organicFertilizer', monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 200, 0], total: 400 },
  { labelKey: 'pruning', monthly: [0, 317, 317, 0, 0, 0, 0, 0, 0, 0, 0, 317], total: 951 },
  { labelKey: 'wasteDisposal', monthly: [0, 0, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0], total: 100 },
  { labelKey: 'soilCultivation', monthly: [0, 0, 60, 60, 60, 60, 60, 0, 0, 0, 0, 0], total: 240 },
  { labelKey: 'irrigation', monthly: [0, 0, 0, 0, 140, 140, 140, 140, 0, 0, 0, 0], total: 420 },
  { labelKey: 'sprayingPesticides', monthly: [0, 550, 550, 550, 550, 1350, 550, 550, 0, 0, 0, 0], total: 4650 },
  { labelKey: 'harvest', monthly: [0, 0, 0, 0, 0, 0, 0, 400, 400, 0, 0, 0], total: 800 },
  { labelKey: 'harvestTransportation', monthly: [0, 0, 0, 0, 0, 0, 0, 100, 100, 0, 0, 0], total: 200 },
];

// Bottom-of-table totals row, taken verbatim from the spreadsheet (CSV row 13).
export const DIRECT_COSTS_TOTALS: {
  monthly: readonly [number, number, number, number, number, number, number, number, number, number, number, number];
  total: number;
} = {
  monthly: [0, 1017, 977, 810, 750, 1550, 750, 1190, 650, 1100, 1100, 317],
  total: 10211,
};

// ─── Annual Summary, 5 ha (USD) — CSV rows 52–57 / PRD Item 5 ─────────────
// "Monthly cash flow — USD (5 ha)" — Direct + Management costs vs Potential
// Income → Free cash. Free cash includes the fixed $1,750/mo Management
// cost, so the annual total is $102,945 (vs the GEL-only working total of
// $123,945 that excluded Management costs). Values verbatim from the CSV.
export interface AnnualCashFlowRow {
  labelKey: string;
  // Positive/zero values render normal; negatives use the consistent red
  // styling defined in the General UI Requirements.
  monthly: readonly [number, number, number, number, number, number, number, number, number, number, number, number];
  total: number;
}

// ─── Regional Seasonal Loans (Aggregate Portfolio, USD) — PRD Item 11 ────
// PM-supplied regional portfolio totals — NOT individual-farm amounts.
// Numbers in the billions. Used as-is, no derivation.
export interface RegionalLoanRow {
  activityKey: string;
  region: string;
  periodKey: string;
  totalPortfolioSizeUsd: number;
}

export const REGIONAL_LOAN_ROWS: RegionalLoanRow[] = [
  { activityKey: 'soilPreparation', region: 'Fergana', periodKey: 'febMay', totalPortfolioSizeUsd: 950050000 },
  { activityKey: 'mineralFertilizer', region: 'Tashkent', periodKey: 'sepNov', totalPortfolioSizeUsd: 740000000 },
  { activityKey: 'pruning', region: 'Samarkand', periodKey: 'decFeb', totalPortfolioSizeUsd: 1345000000 },
  { activityKey: 'sprayingPesticides', region: 'Andijan', periodKey: 'febJul', totalPortfolioSizeUsd: 1740000000 },
  { activityKey: 'harvesting', region: 'Bukhara', periodKey: 'augSep', totalPortfolioSizeUsd: 842000000 },
];

// ─── Monthly Payment Schedule ($1,500 Soil Preparation) — PRD Item 10 ────
// Demonstrates how an 8-month loan disbursed Feb–May ripples through monthly
// free cash. Loan payments start in April. Monthly Free Cash mirrors the
// USD Cash Flow's Free Cash row exactly. All values verbatim from the CSV.
export interface PaymentScheduleRow {
  monthKey: string;
  loanPaymentUsd: number; // negative when paying back
  monthlyFreeCashUsd: number;
  remainingCashUsd: number;
}

export const MONTHLY_PAYMENT_LOAN_SIZE_USD = 1500;

export const MONTHLY_PAYMENT_SCHEDULE: PaymentScheduleRow[] = [
  { monthKey: 'january', loanPaymentUsd: 0, monthlyFreeCashUsd: -1750, remainingCashUsd: -1750 },
  { monthKey: 'february', loanPaymentUsd: 0, monthlyFreeCashUsd: -6835, remainingCashUsd: -6835 },
  { monthKey: 'march', loanPaymentUsd: 0, monthlyFreeCashUsd: -6635, remainingCashUsd: -6635 },
  { monthKey: 'april', loanPaymentUsd: -207, monthlyFreeCashUsd: -5800, remainingCashUsd: -6007 },
  { monthKey: 'may', loanPaymentUsd: -207, monthlyFreeCashUsd: -5500, remainingCashUsd: -5707 },
  { monthKey: 'june', loanPaymentUsd: -207, monthlyFreeCashUsd: -9500, remainingCashUsd: -9707 },
  { monthKey: 'july', loanPaymentUsd: -207, monthlyFreeCashUsd: -5500, remainingCashUsd: -5707 },
  { monthKey: 'august', loanPaymentUsd: -207, monthlyFreeCashUsd: 79800, remainingCashUsd: 79593 },
  { monthKey: 'september', loanPaymentUsd: -207, monthlyFreeCashUsd: 82500, remainingCashUsd: 82293 },
  { monthKey: 'october', loanPaymentUsd: -207, monthlyFreeCashUsd: -7250, remainingCashUsd: -7457 },
  { monthKey: 'november', loanPaymentUsd: -207, monthlyFreeCashUsd: -7250, remainingCashUsd: -7457 },
  { monthKey: 'december', loanPaymentUsd: 0, monthlyFreeCashUsd: -3335, remainingCashUsd: -3335 },
];

// ─── Potential Seasonal Loans (Individual Farm, USD) — CSV rows 81–94 ────
// PRD Item 9. All loans share the same 28% annual rate and 8-month term.
// Monthly payments + totals are taken verbatim from the PM's spreadsheet
// (slight rounding differences from PMT(28%/12, 8) preserved per "as-is").
export interface SeasonalLoanRow {
  activityKey: string;
  periodKey: string;
  loanSizeUsd: number;
  monthlyPaymentUsd: number;
  totalPaymentUsd: number;
}

export const SEASONAL_LOANS_ANNUAL_RATE = 0.28;
export const SEASONAL_LOANS_TERM_MONTHS = 8;

export const SEASONAL_LOAN_ROWS: SeasonalLoanRow[] = [
  { activityKey: 'soilPreparation', periodKey: 'febMay', loanSizeUsd: 1500, monthlyPaymentUsd: 207, totalPaymentUsd: 1656 },
  { activityKey: 'mineralFertilizer', periodKey: 'sepNov', loanSizeUsd: 9750, monthlyPaymentUsd: 1350, totalPaymentUsd: 10800 },
  { activityKey: 'pruning', periodKey: 'decFeb', loanSizeUsd: 4755, monthlyPaymentUsd: 658, totalPaymentUsd: 5264 },
  { activityKey: 'sprayingPesticides', periodKey: 'febJul', loanSizeUsd: 23250, monthlyPaymentUsd: 3219, totalPaymentUsd: 25752 },
  { activityKey: 'harvesting', periodKey: 'augSep', loanSizeUsd: 4000, monthlyPaymentUsd: 553, totalPaymentUsd: 4424 },
];

// ─── Revenue Scenario Analysis — CSV rows 65–69 / PRD Item 7 ─────────────
// Three scenarios for the 5 ha farm. Per the PRD screenshot, the Realistic
// scenario is the "base case" and gets a green-border highlight in the UI.
export type ScenarioId = 'conservative' | 'realistic' | 'optimistic';

export interface RevenueScenario {
  id: ScenarioId;
  yieldPerHaTonnes: number;
  pricePerKgUsd: number;
  revenuePerHaUsd: number;
  totalYieldTonnes: number;
  totalRevenueUsd: number;
  costsUsd: number;
  freeCashUsd: number;
  isBaseCase?: boolean;
}

export const REVENUE_SCENARIOS: RevenueScenario[] = [
  {
    id: 'conservative',
    yieldPerHaTonnes: 22,
    pricePerKgUsd: 0.95,
    revenuePerHaUsd: 20900,
    totalYieldTonnes: 110,
    totalRevenueUsd: 104500,
    costsUsd: 55555,
    freeCashUsd: 48945,
  },
  {
    id: 'realistic',
    yieldPerHaTonnes: 27,
    pricePerKgUsd: 1.0,
    revenuePerHaUsd: 27000,
    totalYieldTonnes: 135,
    totalRevenueUsd: 135000,
    costsUsd: 53055,
    freeCashUsd: 81945,
    isBaseCase: true,
  },
  {
    id: 'optimistic',
    yieldPerHaTonnes: 30,
    pricePerKgUsd: 1.05,
    revenuePerHaUsd: 31500,
    totalYieldTonnes: 150,
    totalRevenueUsd: 157500,
    costsUsd: 51055,
    freeCashUsd: 106445,
  },
];

// ─── Yield Assumption — CSV rows 60–63 / PRD Item 6 ──────────────────────
// Three reference numbers used by Revenue Scenario calculations downstream.
export const YIELD_ASSUMPTION = {
  standardYieldTonnesPerHa: 30,
  telagriYieldTonnesPerHa: 24,
  marketPricePerKgUsd: 1,
} as const;

// ─── Realistic Profit (score-adjusted) — CSV rows 72–77 / PRD Item 8 ──────
// Four indices feed a single profit estimate. PRD says use as-is — we don't
// recompute the profit from the indices.
export const REALISTIC_PROFIT = {
  farmScore: 6.3,
  regionalIndex: 8.4,
  costVariationIndex: 3.4,
  priceVariationIndex: 5.8,
  profitUsd: 78810,
} as const;

export const ANNUAL_CASHFLOW_USD_ROWS: AnnualCashFlowRow[] = [
  {
    labelKey: 'directCosts',
    monthly: [0, 5085, 4885, 4050, 3750, 7750, 3750, 5950, 3250, 5500, 5500, 1585],
    total: 51055,
  },
  {
    labelKey: 'mgmtCosts',
    monthly: [1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750, 1750],
    total: 21000,
  },
  {
    labelKey: 'potentialIncome',
    monthly: [0, 0, 0, 0, 0, 0, 0, 87500, 87500, 0, 0, 0],
    total: 175000,
  },
  {
    labelKey: 'freeCash',
    monthly: [-1750, -6835, -6635, -5800, -5500, -9500, -5500, 79800, 82500, -7250, -7250, -3335],
    total: 102945,
  },
];
