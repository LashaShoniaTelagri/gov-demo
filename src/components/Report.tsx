import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { orchard: any };

const Report = forwardRef<HTMLDivElement, Props>(({ orchard }, ref) => {
  const { t } = useTranslation();
  const p = orchard.properties;
  const recommendations: string[] = [];
  if (!p.irrigation?.has) recommendations.push(t('targeting.addIrrigation'));
  if ((p.flags || []).includes('low_soil_n')) recommendations.push(t('targeting.improveFertilization'));

  const ndviSeries = Array.from({ length: 12 }).map((_, i) => ({
    month: i + 1,
    value: Math.max(0, Math.min(1, (p.indices?.ndvi_mean ?? 0.5) + Math.sin(i / 12 * Math.PI * 2) * 0.08))
  }));

  return (
    <div ref={ref as any} className="p-6 text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
        <div className="text-sm">{new Date().toLocaleString()}</div>
      </div>
      <h2 className="text-xl font-semibold mb-2">{t('orchard.id', { id: p.orchard_id })}</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div><span className="font-medium">{t('table.crop')}:</span> {p.crop}</div>
        <div><span className="font-medium">{t('orchard.area')}:</span> {p.area_ha} ha</div>
        <div><span className="font-medium">{t('filters.region')}:</span> {p.region}</div>
        <div><span className="font-medium">{t('filters.municipality')}:</span> {p.municipality}</div>
        <div><span className="font-medium">{t('orchard.irrigation')}:</span> {p.irrigation?.has ? t('common.yes') : t('common.no')}</div>
        <div><span className="font-medium">{t('orchard.score')}:</span> {p.score}</div>
      </div>

      <h3 className="text-lg font-semibold mb-1">{t('charts.scoreBreakdown')}</h3>
      <ul className="list-disc list-inside mb-4 text-sm">
        <li>{t('score.irrigation')}: {p.irrigation?.has ? 100 : 0}</li>
        <li>{t('score.soil')}: {p.soilQualityScore ?? 60}</li>
        <li>{t('score.plantHealth')}: {p.plantHealthScore ?? Math.round(p.indices?.vigor_index * 100)}</li>
        <li>{t('score.weeds')}: {p.weedScore ?? 70}</li>
        <li>{t('score.pest')}: {p.pestScore ?? 70}</li>
        <li>{t('score.management')}: {p.managementScore ?? 70}</li>
      </ul>

      <h3 className="text-lg font-semibold mb-1">{t('charts.ndviTrend')}</h3>
      <table className="w-full text-sm border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">{t('charts.month')}</th>
            {ndviSeries.map((s) => (<th key={s.month} className="border px-2 py-1">{s.month}</th>))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">{t('charts.ndvi')}</td>
            {ndviSeries.map((s) => (<td key={s.month} className="border px-2 py-1">{s.value.toFixed(2)}</td>))}
          </tr>
        </tbody>
      </table>

      <h3 className="text-lg font-semibold mb-1">{t('report.download')}</h3>
      <ul className="list-disc list-inside text-sm">
        {recommendations.length === 0 ? (
          <li>{t('kpi.avgScore')}: {p.score}</li>
        ) : recommendations.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
});

export default Report;


