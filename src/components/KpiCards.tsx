import React, { useMemo } from 'react';
import orchardsRaw from '../data/orchards.geojson?raw';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';
import NdviTrend from './NdviTrend';

const KpiCards: React.FC = () => {
  const { t } = useTranslation();
  const { filters } = useAppStore();
  const orchards = JSON.parse(orchardsRaw);
  const { metrics, series } = useMemo(() => {
    const features = (orchards as any).features as any[];
    const filtered = features.filter((f) => {
      const p = f.properties;
      if (filters.region && p.region !== filters.region) return false;
      if (filters.municipality && p.municipality !== filters.municipality) return false;
      if (filters.crop && p.crop !== filters.crop) return false;
      if (filters.irrigation !== undefined && Boolean(p.irrigation?.has) !== filters.irrigation) return false;
      if (p.age_years < filters.ageRange[0] || p.age_years > filters.ageRange[1]) return false;
      if (p.score < filters.scoreRange[0] || p.score > filters.scoreRange[1]) return false;
      return true;
    });
    const count = filtered.length;
    const totalArea = filtered.reduce((sum, f) => sum + (f.properties.area_ha || 0), 0);
    const avgScore = filtered.reduce((sum, f) => sum + (f.properties.score || 0), 0) / Math.max(1, count);
    const irrigated = filtered.filter(f => Boolean(f.properties.irrigation?.has)).length;
    const flagged = filtered.filter(f => (f.properties.flags || []).length > 0).length;
    const meanNdvi = filtered.reduce((sum, f) => sum + (f.properties.indices?.ndvi_mean || 0), 0) / Math.max(1, count);
    const series = Array.from({ length: 12 }).map((_, i) => ({
      month: `${i + 1}`,
      value: Math.max(0, Math.min(1, meanNdvi + Math.sin(i / 12 * Math.PI * 2) * 0.08))
    }));
    return { metrics: { count, totalArea, avgScore, irrigatedPct: Math.round((irrigated / Math.max(1, count)) * 100), flagged }, series };
  }, [filters]);

  const items = [
    { label: t('kpi.orchards'), value: metrics.count },
    { label: t('kpi.totalArea'), value: `${metrics.totalArea.toFixed(1)} ${t('unit.ha')}` },
    { label: t('kpi.avgScore'), value: metrics.avgScore.toFixed(0) }
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.label} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">{it.label}</div>
            <div className="text-xl font-semibold text-gray-900">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block">
        <NdviTrend series={series} title={t('charts.ndviTrend')} />
      </div>
    </div>
  );
};

export default KpiCards;


