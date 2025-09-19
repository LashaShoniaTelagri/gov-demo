import React from 'react';
import { useAppStore } from '../lib/store';
import { useTranslation } from 'react-i18next';

const LayerToggles: React.FC = () => {
  const { t } = useTranslation();
  const { toggles, setToggles, filters, setFilters } = useAppStore();
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
      <h3 className="text-sm font-medium text-gray-900">{t('layers.title')}</h3>
      <fieldset className="space-y-1">
        <legend className="text-xs font-medium text-gray-700">{t('layers.index.title')}</legend>
        <div className="grid grid-cols-2 gap-1 text-sm text-gray-700">
          {(['ndvi','evi','ndre','mcari','pri','ndwi','ndmi','lswi','savi','msavi'] as const).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean((filters.indices as any)[key])} onChange={(e) => setFilters({ indices: { ...filters.indices, [key]: e.target.checked } })} />
              {key.toUpperCase()}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium text-gray-700">{t('filters.lab.title')}</legend>
        <div className="space-y-3">
          {(['ph','n','p','k'] as const).map((key) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs text-gray-700 uppercase">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-28 rounded border-gray-300"
                  placeholder="0"
                  value={(filters.lab[key]?.[0] ?? '') as any}
                  onChange={(e) => setFilters({ lab: { ...filters.lab, [key]: [Number(e.target.value), filters.lab[key]?.[1] ?? 100] } })}
                />
                <span>–</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-28 rounded border-gray-300"
                  placeholder="0"
                  value={(filters.lab[key]?.[1] ?? '') as any}
                  onChange={(e) => setFilters({ lab: { ...filters.lab, [key]: [filters.lab[key]?.[0] ?? 0, Number(e.target.value)] } })}
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-gray-700">{t('filters.diseases.title')}</legend>
        <div className="space-y-1 text-sm text-gray-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.diseases.alternaria_alternata} onChange={(e)=>setFilters({ diseases: { ...filters.diseases, alternaria_alternata: e.target.checked } })} />{t('filters.diseases.alternaria_alternata')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.diseases.verticillium_dahliae} onChange={(e)=>setFilters({ diseases: { ...filters.diseases, verticillium_dahliae: e.target.checked } })} />{t('filters.diseases.verticillium_dahliae')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.diseases.colletotrichum_acutatum} onChange={(e)=>setFilters({ diseases: { ...filters.diseases, colletotrichum_acutatum: e.target.checked } })} />{t('filters.diseases.colletotrichum_acutatum')}</label>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-gray-700">{t('filters.insects.title')}</legend>
        <div className="space-y-1 text-sm text-gray-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.insects.myzus_persicae} onChange={(e)=>setFilters({ insects: { ...filters.insects, myzus_persicae: e.target.checked } })} />{t('filters.insects.myzus_persicae')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.insects.cydia_pomonella} onChange={(e)=>setFilters({ insects: { ...filters.insects, cydia_pomonella: e.target.checked } })} />{t('filters.insects.cydia_pomonella')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.insects.tetranychus_urticae} onChange={(e)=>setFilters({ insects: { ...filters.insects, tetranychus_urticae: e.target.checked } })} />{t('filters.insects.tetranychus_urticae')}</label>
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={toggles.showAdmin} onChange={(e) => setToggles({ showAdmin: e.target.checked })} />
        {t('layers.admin')}
      </label>
    </div>
  );
};

export default LayerToggles;


