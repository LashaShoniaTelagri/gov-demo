import React, { useMemo, useState } from 'react';
import orchardsRaw from '../data/orchards.geojson?raw';
import { useTranslation } from 'react-i18next';

type SimRow = {
  id: string;
  crop: string;
  area: number;
  score: number;
  delta: number;
};

const TargetingList: React.FC = () => {
  const { t } = useTranslation();
  const [irrigation, setIrrigation] = useState(false);
  const [fert, setFert] = useState(false);

  const rows = useMemo<SimRow[]>(() => {
    const orchards = JSON.parse(orchardsRaw);
    const features = (orchards as any).features as any[];
    return features
      .map((f) => ({
        id: f.properties.orchard_id,
        crop: f.properties.crop,
        area: f.properties.area_ha,
        score: f.properties.score,
        delta: (irrigation ? 15 : 0) + (fert ? 10 : 0),
      }))
      .sort((a, b) => a.score - b.score);
  }, [irrigation, fert]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-4">
        <div className="text-sm font-medium text-gray-900">{t('targeting.controls')}</div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} />
          {t('targeting.addIrrigation')} (+15)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={fert} onChange={(e) => setFert(e.target.checked)} />
          {t('targeting.improveFertilization')} (+10)
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded">
        <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-gray-500 border-b">
          <div>{t('table.orchard')}</div>
          <div>{t('table.crop')}</div>
          <div>{t('table.area')}</div>
          <div>{t('table.score')}</div>
          <div>{t('table.after')}</div>
        </div>
        <div className="divide-y">
          {rows.map((r) => {
            const after = Math.min(100, r.score + r.delta);
            return (
              <div key={r.id} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm">
                <div className="font-medium">{r.id}</div>
                <div>{r.crop}</div>
                <div>{r.area} ha</div>
                <div>{r.score}</div>
                <div className="flex items-center gap-2">
                  <span>{after}</span>
                  <span className="text-green-700">(+{after - r.score})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TargetingList;


