import React, { useMemo, useRef } from 'react';
import { useAppStore } from '../lib/store';
import orchardsRaw from '../data/orchards.geojson?raw';
import visits from '../data/visits.json';
import ScoreRadar from './ScoreRadar';
import NdviTrend from './NdviTrend';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import Report from './Report';

type Props = { embedded?: boolean };

const OrchardDrawer: React.FC<Props> = ({ embedded = false }) => {
  const { t } = useTranslation();
  const { ui, setUI } = useAppStore();
  const feature = useMemo(() => {
    const orchards = JSON.parse(orchardsRaw);
    const features = (orchards as any).features as any[];
    return features.find(f => f.properties.orchard_id === ui.selectedOrchardId);
  }, [ui.selectedOrchardId]);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const containerClass = embedded
    ? 'h-full bg-white border border-gray-200 rounded-lg flex flex-col'
    : 'absolute top-0 right-0 h-full w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col';

  if (!feature) {
    return (
      <div className={containerClass}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">{t('panel.right')}</div>
        </div>
        <div className="p-4 text-sm text-gray-600">{t('orchard.selectPrompt')}</div>
      </div>
    );
  }
  const p = feature.properties;
  const orchardVisits = Array.isArray((visits as any)[p.orchard_id]) ? (visits as any)[p.orchard_id] : [];

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const to0to100 = (n: unknown, fallback = 0) => {
    const num = typeof n === 'number' && Number.isFinite(n) ? n : NaN;
    return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : fallback;
  };

  const radar = [
    { key: 'irrigation', label: t('score.irrigation'), value: p.irrigation?.has ? 100 : 0 },
    { key: 'soil', label: t('score.soil'), value: to0to100(p.soilQualityScore, 60) },
    { key: 'plant', label: t('score.plantHealth'), value: to0to100(p.plantHealthScore ?? ((p.indices?.vigor_index ?? 0.5) * 100), 60) },
    { key: 'weed', label: t('score.weeds'), value: to0to100(p.weedScore, 70) },
    { key: 'pest', label: t('score.pest'), value: to0to100(p.pestScore, 70) },
    { key: 'mgmt', label: t('score.management'), value: to0to100(p.managementScore, 70) },
  ];

  const ndviBase = typeof p.indices?.ndvi_mean === 'number' && Number.isFinite(p.indices.ndvi_mean) ? p.indices.ndvi_mean : 0.5;
  const ndviSeries = Array.from({ length: 12 }).map((_, i) => ({
    month: `${i + 1}`,
    value: clamp01(ndviBase + (Math.sin(i / 12 * Math.PI * 2) * 0.1))
  }));


  return (
    <div className={containerClass}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{p.crop}</div>
          <div className="text-lg font-semibold text-gray-900">{t('orchard.id', { id: p.orchard_id })}</div>
        </div>
        <button onClick={() => setUI({ selectedOrchardId: undefined, showRightPanel: false })} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="p-4 space-y-3 overflow-auto">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">{t('orchard.area')}</div>
            <div className="text-sm font-medium">{p.area_ha} ha</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">{t('orchard.age')}</div>
            <div className="text-sm font-medium">{p.age_years}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">{t('orchard.irrigation')}</div>
            <div className="text-sm font-medium">{p.irrigation?.has ? t('common.yes') : t('common.no')}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">{t('orchard.score')}</div>
            <div className="text-sm font-medium">{p.score}</div>
          </div>
        </div>

        <ScoreRadar values={radar} />
        <NdviTrend series={ndviSeries} />

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-900 mb-2">{t('visits.title')}</div>
          <div className="space-y-3">
            {orchardVisits.map((v: any, idx: number) => (
              <div key={idx} className="border rounded p-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">{v.season}</div>
                  <div className="text-gray-500">{new Date(v.date).toLocaleDateString()}</div>
                </div>
                <div className="text-xs text-gray-600">{t('visits.weeds')}: {v.weeds} • {t('visits.pest')}: {v.pest}</div>
                <div className="text-sm text-gray-700 mt-1">{v.notes}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handlePrint} className="w-full bg-brand text-white rounded py-2 hover:bg-brand-dark">{t('report.download')}</button>
        <div className="hidden">
          <div ref={printRef}>
            <Report orchard={feature} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrchardDrawer;


