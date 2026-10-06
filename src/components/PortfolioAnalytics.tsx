import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList, Label } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { Farmer } from './PortfolioMap';
import { translateCrop, translateRegion } from '../lib/regionTranslations';
import RiskTrendChart from './RiskTrendChart';

interface PortfolioAnalyticsProps {
  farmers: Farmer[];
}

type GroupScore = {
  id: string;
  name: string;
  score: number;
  count: number;
  riskBreakdown?: {
    high: number;
    observation: number;
    controlled: number;
  };
};

type LoanBand = {
  id: string;
  label: string;
  min: number;
  max: number;
};

// Risk status colors matching the UI buttons
const RISK_COLORS = {
  high: '#ef4444',      // red-500
  observation: '#fbbf24', // yellow-400
  controlled: '#10b981', // green-500
};

// Map score to risk status color based on score ranges
const getScoreBasedColor = (score: number): string => {
  if (score >= 8.1) {
    return RISK_COLORS.controlled; // Green for high scores (controlled)
  } else if (score >= 6.1) {
    return RISK_COLORS.observation; // Yellow for medium scores (observation)
  } else {
    return RISK_COLORS.high; // Red for low scores (high risk)
  }
};

const RADIAN = Math.PI / 180;

const SCORE_BANDS = [
  { id: 'excellent', labelKey: 'portfolio.analytics.bands.excellent', range: '9.1 – 10.0', color: '#10b981', min: 9.1, max: 10 },
  { id: 'good', labelKey: 'portfolio.analytics.bands.good', range: '6.1 – 8.0', color: '#fbbf24', min: 6.1, max: 8 },
  { id: 'watch', labelKey: 'portfolio.analytics.bands.watch', range: '4.1 – 6.0', color: '#f97316', min: 4.1, max: 6 },
  { id: 'risk', labelKey: 'portfolio.analytics.bands.risk', range: '2.1 – 4.0', color: '#ef4444', min: 2.1, max: 4 },
  { id: 'critical', labelKey: 'portfolio.analytics.bands.critical', range: '0.0 – 2.0', color: '#111827', min: 0, max: 2 },
];

const LOAN_BANDS: LoanBand[] = [
  { id: '0-20k', label: '0-20 K', min: 0, max: 20000 },
  { id: '20-40k', label: '20-40 K', min: 20000, max: 40000 },
  { id: '40-70k', label: '40-70 K', min: 40000, max: 70000 },
  { id: '70-100k', label: '70-100 K', min: 70000, max: 100000 },
  { id: '100-250k', label: '100-250 K', min: 100000, max: 250000 },
  { id: '250-500k', label: '250-500 K', min: 250000, max: 500000 },
  { id: '500-750k', label: '500-750 K', min: 500000, max: 750000 },
  { id: '750k-1mln', label: '750 K-1 MLN', min: 750000, max: 1000000 },
  { id: '1-1.5mln', label: '1-1.5 MLN', min: 1000000, max: 1500000 },
  { id: '1.5-2mln', label: '1.5-2 MLN', min: 1500000, max: 2000000 },
  { id: '2-3mln', label: '2-3 MLN', min: 2000000, max: 3000000 },
  { id: '3mln+', label: '3+ MLN', min: 3000000, max: Infinity },
];

const getScoreBandColor = (score?: number) => {
  if (score === undefined || Number.isNaN(score)) {
    return '#9ca3af';
  }
  const band = SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.color : '#9ca3af';
};

const LegendList: React.FC<{ items: GroupScore[] }> = ({ items }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getScoreBandColor(item.score) }} />
          <span className="text-sm text-gray-700">{item.name}</span>
          <span className="text-xs text-gray-500">({item.count})</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">{item.score.toFixed(1)}</span>
      </div>
    ))}
  </div>
);

const renderPieLabel = ({ name, cx, cy, midAngle, outerRadius }: PieLabelRenderProps) => {
  if (!name || cx === undefined || cy === undefined || midAngle === undefined || outerRadius === undefined) {
    return null;
  }
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      fontSize={12}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {name}
    </text>
  );
};

const PieCard: React.FC<{ title: string; data: GroupScore[] }> = ({ title, data }) => {
  const { t } = useTranslation();
  const hasData = data.length > 0;
  
  // Check if this is loan band data (preserve order by loan amount)
  const isLoanData = data.length > 0 && LOAN_BANDS.some(band => band.id === data[0].id);
  const sortedData = isLoanData ? [...data] : [...data].sort((a, b) => b.count - a.count);

  // Transform data for stacked bars showing risk status breakdown
  const barChartData = useMemo(() => {
    return sortedData.map((item) => {
      const breakdown = item.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
      return {
        name: item.name,
        high: breakdown.high,
        observation: breakdown.observation,
        controlled: breakdown.controlled,
        total: item.count,
        score: item.score,
      };
    });
  }, [sortedData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="h-64">
        {hasData && barChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                width={80}
              >
                <Label 
                  value={t('portfolio.analytics.numberOfFarmers')} 
                  angle={-90} 
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fontSize: 11 }}
                />
              </YAxis>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const data = payload[0].payload;
                  const category = data.name;
                  const total = data.total || 0;
                  
                  return (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3">
                      <p className="font-semibold text-sm text-gray-800 mb-2">{category}</p>
                      <div className="space-y-1">
                        {payload.map((entry: any, index: number) => {
                          const value = entry.value as number;
                          if (value === 0) return null;
                          
                          const statusLabel = entry.dataKey === 'high' ? t('portfolio.highRisk') : 
                                           entry.dataKey === 'observation' ? t('portfolio.needsObservation') : 
                                           t('portfolio.underControl');
                          const color = entry.dataKey === 'high' ? RISK_COLORS.high :
                                      entry.dataKey === 'observation' ? RISK_COLORS.observation :
                                      RISK_COLORS.controlled;
                          
                          return (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                              <span style={{ color: color }} className="font-medium">
                                {statusLabel}: {value} {value === 1 ? t('portfolio.analytics.farmer') : t('portfolio.analytics.farmers')}
                              </span>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                            <span>{t('portfolio.analytics.total')}</span>
                            <span>{total} {total === 1 ? t('portfolio.analytics.farmer') : t('portfolio.analytics.farmers')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="high" 
                name={t('portfolio.highRisk')} 
                stackId="status"
                fill={RISK_COLORS.high}
                stroke="#fff"
                strokeWidth={1}
              />
              <Bar 
                dataKey="observation" 
                name={t('portfolio.needsObservation')} 
                stackId="status"
                fill={RISK_COLORS.observation}
                stroke="#fff"
                strokeWidth={1}
              />
              <Bar 
                dataKey="controlled" 
                name={t('portfolio.underControl')} 
                stackId="status"
                fill={RISK_COLORS.controlled}
                stroke="#fff"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">—</div>
        )}
      </div>
    </div>
  );
};

// Risk Factor Chart Component for Agronomic Risk Overview
const RiskFactorChart: React.FC<{ 
  title: string; 
  data: Array<{ name: string; high: number; observation: number; controlled: number; total: number }>;
  categoryLabel: string;
  riskFactorTitle: string;
}> = ({ title, data, categoryLabel, riskFactorTitle }) => {
  const { t } = useTranslation();
  
  if (data.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <h5 className="text-base font-semibold text-gray-800 mb-0 pl-[110px]">{title}</h5>
      <div className="h-96 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 15, bottom: 15 }}
            barSize={50}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 13 }}
            >
              <Label 
                value={t('portfolio.analytics.numberOfFarmers')} 
                position="insideBottom"
                offset={-5}
                style={{ textAnchor: 'middle', fontSize: 13 }}
              />
            </XAxis>
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                
                const data = payload[0].payload;
                const itemName = data.name;
                const total = data.total || 0;
                
                return (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3">
                    <p className="font-semibold text-sm text-gray-800 mb-1">{riskFactorTitle}</p>
                    <p className="text-xs text-gray-600 mb-1">{categoryLabel}</p>
                    <p className="text-xs font-medium text-gray-800 mb-2">{itemName}</p>
                    <div className="space-y-1">
                      {data.high > 0 && (
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.high }}></div>
                            <span style={{ color: RISK_COLORS.high }} className="font-medium">
                              {t('portfolio.highRisk')}
                            </span>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            {data.high} ({total > 0 ? ((data.high / total) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      )}
                      {data.observation > 0 && (
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.observation }}></div>
                            <span style={{ color: RISK_COLORS.observation }} className="font-medium">
                              {t('portfolio.needsObservation')}
                            </span>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            {data.observation} ({total > 0 ? ((data.observation / total) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      )}
                      {data.controlled > 0 && (
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.controlled }}></div>
                            <span style={{ color: RISK_COLORS.controlled }} className="font-medium">
                              {t('portfolio.underControl')}
                            </span>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            {data.controlled} ({total > 0 ? ((data.controlled / total) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                          <span>{t('portfolio.analytics.total')}</span>
                          <span>{total} {total === 1 ? t('portfolio.analytics.farmer') : t('portfolio.analytics.farmers')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="high" 
              name={t('portfolio.highRisk')} 
              stackId="status"
              fill={RISK_COLORS.high}
              stroke="#fff"
              strokeWidth={1}
            />
            <Bar 
              dataKey="observation" 
              name={t('portfolio.needsObservation')} 
              stackId="status"
              fill={RISK_COLORS.observation}
              stroke="#fff"
              strokeWidth={1}
            />
            <Bar 
              dataKey="controlled" 
              name={t('portfolio.underControl')} 
              stackId="status"
              fill={RISK_COLORS.controlled}
              stroke="#fff"
              strokeWidth={1}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// V2: Horizontal Bar Chart Component
const HorizontalBarCard: React.FC<{ title: string; data: GroupScore[] }> = ({ title, data }) => {
  const { t } = useTranslation();
  const hasData = data.length > 0;
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  // Transform data for stacked bars showing risk status breakdown
  const barChartData = useMemo(() => {
    return sortedData.map((item) => {
      const breakdown = item.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
      return {
        name: item.name,
        high: breakdown.high,
        observation: breakdown.observation,
        controlled: breakdown.controlled,
        total: item.count,
        score: item.score,
      };
    });
  }, [sortedData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="h-52">
        {hasData && barChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 'dataMax']} 
                tick={{ fontSize: 11 }} 
              />
              <YAxis
                type="category"
                dataKey="name"
                width={75}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const data = payload[0].payload;
                  const loanBand = data.name;
                  
                  return (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3">
                      <p className="font-semibold text-sm text-gray-800 mb-2">{loanBand}</p>
                      <div className="space-y-1">
                        {payload.map((entry: any, index: number) => {
                          const value = entry.value as number;
                          if (value === 0) return null;
                          
                          const statusLabel = entry.dataKey === 'high' ? t('portfolio.highRisk') : 
                                           entry.dataKey === 'observation' ? t('portfolio.needsObservation') : 
                                           t('portfolio.underControl');
                          const color = entry.dataKey === 'high' ? RISK_COLORS.high :
                                      entry.dataKey === 'observation' ? RISK_COLORS.observation :
                                      RISK_COLORS.controlled;
                          
                          return (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                              <span style={{ color: color }} className="font-medium">
                                {statusLabel}: {value} {value === 1 ? t('portfolio.analytics.farmer') : t('portfolio.analytics.farmers')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar 
                dataKey="high" 
                name={t('portfolio.highRisk')} 
                stackId="status"
                fill={RISK_COLORS.high}
                stroke="#fff"
                strokeWidth={1}
              />
              <Bar 
                dataKey="observation" 
                name={t('portfolio.needsObservation')} 
                stackId="status"
                fill={RISK_COLORS.observation}
                stroke="#fff"
                strokeWidth={1}
              />
              <Bar 
                dataKey="controlled" 
                name={t('portfolio.underControl')} 
                stackId="status"
                fill={RISK_COLORS.controlled}
                stroke="#fff"
                strokeWidth={1}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">—</div>
        )}
      </div>
    </div>
  );
};

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ farmers }) => {
  const { t, i18n } = useTranslation();

  const getScoreValue = (farmer: Farmer): number => {
    if (typeof farmer.score === 'number') return farmer.score;
    if (farmer.riskStatus === 'high') return 2.5;
    if (farmer.riskStatus === 'observation') return 6;
    return 8;
  };

  const getLoanBand = (loanAmount: number): LoanBand => {
    const match = LOAN_BANDS.find((band) => loanAmount >= band.min && loanAmount < band.max);
    return match || LOAN_BANDS[LOAN_BANDS.length - 1];
  };

  const buildGroupScores = (groupBy: 'crop' | 'region' | 'loan'): GroupScore[] => {
    const aggregate = new Map<string, { 
      total: number; 
      count: number; 
      label: string;
      riskBreakdown: { high: number; observation: number; controlled: number };
    }>();

    farmers.forEach((farmer) => {
      const score = getScoreValue(farmer);
      let key = '';
      let label = '';

      if (groupBy === 'crop') {
        key = farmer.crop;
        label = translateCrop(farmer.crop, i18n.language);
      } else if (groupBy === 'region') {
        key = farmer.region;
        label = translateRegion(farmer.region, i18n.language);
      } else {
        const band = getLoanBand(farmer.loanAmount);
        key = band.id;
        label = band.label;
      }

      const current = aggregate.get(key);
      if (current) {
        const breakdown = current.riskBreakdown;
        breakdown[farmer.riskStatus]++;
        aggregate.set(key, { 
          ...current, 
          total: current.total + score, 
          count: current.count + 1,
          riskBreakdown: breakdown
        });
      } else {
        const breakdown = { high: 0, observation: 0, controlled: 0 };
        breakdown[farmer.riskStatus] = 1;
        aggregate.set(key, { 
          total: score, 
          count: 1, 
          label,
          riskBreakdown: breakdown
        });
      }
    });

    const result = Array.from(aggregate.entries())
      .map(([id, value]) => ({
        id,
        name: value.label,
        score: value.total / value.count,
        count: value.count,
        riskBreakdown: value.riskBreakdown,
      }));

    // Sort loan bands by increasing loan amount (min value), others by score
    if (groupBy === 'loan') {
      return result.sort((a, b) => {
        const bandA = LOAN_BANDS.find(band => band.id === a.id);
        const bandB = LOAN_BANDS.find(band => band.id === b.id);
        if (bandA && bandB) {
          // Sort by min value (ascending)
          return bandA.min - bandB.min;
        }
        // If band not found, put it at the end
        if (bandA && !bandB) return -1;
        if (!bandA && bandB) return 1;
        return 0;
      });
    }

    return result.sort((a, b) => b.score - a.score || b.count - a.count);
  };

  const cropScores = useMemo(() => buildGroupScores('crop'), [farmers, i18n.language]);
  const regionScores = useMemo(() => buildGroupScores('region'), [farmers, i18n.language]);
  const loanScores = useMemo(() => buildGroupScores('loan'), [farmers, i18n.language]);

  const topCrops = cropScores.slice(0, 3);
  const bottomCrops = [...cropScores].reverse().slice(0, 3);
  const topRegions = regionScores.slice(0, 3);
  const bottomRegions = [...regionScores].reverse().slice(0, 3);
  const topLoanBands = loanScores.slice(0, 3);
  const underperformingLoanBands = [...loanScores].reverse().slice(0, 3);
  
  // Use all loan bands (already sorted by loan amount in buildGroupScores)
  const combinedLoanBands = useMemo(() => {
    return loanScores;
  }, [loanScores]);

  // Custom sorting for crops: prioritize mixed-risk crops first, then low-risk trending crops
  const sortedCrops = useMemo(() => {
    // Helper function to count how many risk statuses have non-zero counts
    const getRiskStatusCount = (crop: GroupScore): number => {
      const breakdown = crop.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
      let count = 0;
      if (breakdown.high > 0) count++;
      if (breakdown.observation > 0) count++;
      if (breakdown.controlled > 0) count++;
      return count;
    };

    // Separate crops into mixed-risk and low-risk
    const mixedRiskCrops: GroupScore[] = [];
    const lowRiskCrops: GroupScore[] = [];

    cropScores.forEach((crop) => {
      const riskStatusCount = getRiskStatusCount(crop);
      if (riskStatusCount >= 2) {
        // Has multiple risk statuses (e.g., Almond, Blueberry, Grape) - prioritize these
        mixedRiskCrops.push(crop);
      } else {
        // Single risk status - low risk trending (not exclusively "Under Control")
        // Include crops that are trending low risk, even if they have some risk
        lowRiskCrops.push(crop);
      }
    });

    // Sort mixed-risk crops: prioritize by having high risk, then by total farmers count
    mixedRiskCrops.sort((a, b) => {
      const aBreakdown = a.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
      const bBreakdown = b.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
      
      // Prioritize crops with high risk first
      const aHasHigh = aBreakdown.high > 0;
      const bHasHigh = bBreakdown.high > 0;
      if (aHasHigh && !bHasHigh) return -1;
      if (!aHasHigh && bHasHigh) return 1;
      
      // Then by high risk count (more high risk = show first)
      if (aBreakdown.high !== bBreakdown.high) {
        return bBreakdown.high - aBreakdown.high;
      }
      
      // Then by total count (more farmers = show first)
      return b.count - a.count;
    });

    // Sort low-risk crops by score (lower score = lower risk, show first)
    // This ensures low-risk trending crops appear after mixed-risk crops
    lowRiskCrops.sort((a, b) => a.score - b.score);

    // Combine: mixed-risk first (Almond, Blueberry, Grape), then low-risk trending crops
    return [...mixedRiskCrops, ...lowRiskCrops];
  }, [cropScores]);

  // Combined data for single cards
  const allCrops = sortedCrops;
  const allRegions = [...topRegions, ...bottomRegions];

  const pickThree = (items: GroupScore[], offset = 0) => {
    if (items.length === 0) return [];
    // Always cycle through items to ensure we get 3 items
    const extended = [...items, ...items, ...items];
    return extended.slice(offset, offset + 3);
  };

  const riskRows = [
    {
      id: 'irrigation',
      title: t('portfolio.analytics.riskFactors.irrigation'),
      crops: pickThree(bottomCrops, 0),
      regions: pickThree(bottomRegions, 0),
      loans: pickThree(underperformingLoanBands, 0),
    },
    {
      id: 'pests',
      title: t('portfolio.analytics.riskFactors.pests'),
      crops: pickThree(bottomCrops, 3),
      regions: pickThree(bottomRegions, 3),
      loans: pickThree(underperformingLoanBands, 3),
    },
    {
      id: 'water',
      title: t('portfolio.analytics.riskFactors.water'),
      crops: pickThree(bottomCrops, 6),
      regions: pickThree(bottomRegions, 6),
      loans: pickThree(underperformingLoanBands, 6),
    },
    {
      id: 'climate',
      title: t('portfolio.analytics.riskFactors.climate'),
      crops: pickThree(bottomCrops, 0),
      regions: pickThree(bottomRegions, 0),
      loans: pickThree(underperformingLoanBands, 0),
    },
  ];

  if (!farmers.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{t('portfolio.analytics.title')}</h3>
            <p className="text-sm text-gray-500">{t('portfolio.analytics.subtitle')}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">{t('portfolio.analytics.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Risk Trend Analysis - First Section */}
      <div className="space-y-4">
        <RiskTrendChart filteredFarmers={farmers} />
      </div>

      {/* Portfolio performance by Crops and Regions */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">{t('portfolio.analytics.performanceByCropsRegions')}</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <PieCard title={t('portfolio.analytics.crops')} data={allCrops} />
          <PieCard title={t('portfolio.analytics.regions')} data={allRegions} />
        </div>
      </div>

      {/* Loan size analytics */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">{t('portfolio.analytics.loanSizeAnalytics')}</h4>
        <PieCard title={t('portfolio.analytics.combinedLoans')} data={combinedLoanBands} />
      </div>

      {/* Agronomic Risk Overview - Separate Horizontal Stacked Charts for Each Risk Factor */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">{t('portfolio.analytics.agrRiskOverview')}</h4>
        
        {riskRows.map((row) => {
          // Build separate chart data for crops, regions, and loans
          const cropsData = row.crops.map((crop) => {
            const breakdown = crop.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
            return {
              name: crop.name,
              high: breakdown.high,
              observation: breakdown.observation,
              controlled: breakdown.controlled,
              total: breakdown.high + breakdown.observation + breakdown.controlled,
            };
          });

          const regionsData = row.regions.map((region) => {
            const breakdown = region.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
            return {
              name: region.name,
              high: breakdown.high,
              observation: breakdown.observation,
              controlled: breakdown.controlled,
              total: breakdown.high + breakdown.observation + breakdown.controlled,
            };
          });

          const loansData = row.loans.map((loan) => {
            const breakdown = loan.riskBreakdown || { high: 0, observation: 0, controlled: 0 };
            return {
              name: loan.name,
              high: breakdown.high,
              observation: breakdown.observation,
              controlled: breakdown.controlled,
              total: breakdown.high + breakdown.observation + breakdown.controlled,
            };
          });

          return (
            <div key={row.id} className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">{row.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                <div className="min-w-0">
                  <RiskFactorChart 
                    title={t('portfolio.analytics.columns.crops')}
                    data={cropsData}
                    categoryLabel={t('portfolio.analytics.columns.crops')}
                    riskFactorTitle={row.title}
                  />
                </div>
                <div className="min-w-0">
                  <RiskFactorChart 
                    title={t('portfolio.analytics.columns.regions')}
                    data={regionsData}
                    categoryLabel={t('portfolio.analytics.columns.regions')}
                    riskFactorTitle={row.title}
                  />
                </div>
                <div className="min-w-0">
                  <RiskFactorChart 
                    title={t('portfolio.analytics.loanSize')}
                    data={loansData}
                    categoryLabel={t('portfolio.analytics.loanSize')}
                    riskFactorTitle={row.title}
                  />
                </div>
              </div>
              {/* Shared Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.high }}></div>
                  <span className="text-sm text-gray-700">{t('portfolio.highRisk')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.observation }}></div>
                  <span className="text-sm text-gray-700">{t('portfolio.needsObservation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.controlled }}></div>
                  <span className="text-sm text-gray-700">{t('portfolio.underControl')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioAnalytics;

