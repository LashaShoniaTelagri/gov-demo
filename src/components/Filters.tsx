import React, { useMemo } from 'react';
import { useAppStore } from '../lib/store';
import orchardsRaw from '../data/orchards.geojson?raw';
import { useTranslation } from 'react-i18next';

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useAppStore();
  const options = useMemo(() => {
    const orchards = JSON.parse(orchardsRaw);
    const features = (orchards as any).features as any[];
    const regions = Array.from(new Set(features.map(f => f.properties.region))).sort();
    const municipalities = Array.from(new Set(
      features
        .filter(f => !filters.region || f.properties.region === filters.region)
        .map(f => f.properties.municipality)
    )).sort();
    const crops = Array.from(new Set(features.map(f => f.properties.crop))).sort();
    return { regions, municipalities, crops };
  }, [filters.region]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{t('filters.title')}</h3>
      <div className="space-y-2">
        <label className="block text-xs text-gray-600">{t('filters.region')}</label>
        <select
          className="w-full rounded border-gray-300"
          value={filters.region ?? ''}
          onChange={(e) => {
            const next = e.target.value || undefined;
            setFilters({ region: next, municipality: undefined });
          }}
        >
          <option value="">{t('filters.choose')}</option>
          {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-gray-600">{t('filters.municipality')}</label>
        <select className="w-full rounded border-gray-300" value={filters.municipality ?? ''} onChange={(e) => setFilters({ municipality: e.target.value || undefined })}>
          <option value="">{t('filters.choose')}</option>
          {options.municipalities.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-gray-600">{t('filters.crop')}</label>
        <select className="w-full rounded border-gray-300" value={filters.crop ?? ''} onChange={(e) => setFilters({ crop: e.target.value || undefined })}>
          <option value="">{t('filters.choose')}</option>
          {options.crops.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-gray-600">{t('filters.age')}</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="number" className="w-20 sm:w-24 rounded border-gray-300" value={filters.ageRange[0]} onChange={(e) => setFilters({ ageRange: [Number(e.target.value), filters.ageRange[1]] })} />
          <span>–</span>
          <input type="number" className="w-20 sm:w-24 rounded border-gray-300" value={filters.ageRange[1]} onChange={(e) => setFilters({ ageRange: [filters.ageRange[0], Number(e.target.value)] })} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-gray-600">{t('filters.irrigation')}</label>
        <select className="w-full rounded border-gray-300" value={String(filters.irrigation)} onChange={(e) => setFilters({ irrigation: e.target.value === 'undefined' ? undefined : e.target.value === 'true' })}>
          <option value="undefined">{t('filters.choose')}</option>
      <div className="space-y-1">
        <label className="block text-xs text-gray-600">{t('filters.areaHa')}</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="number" className="w-24 sm:w-28 rounded border-gray-300" value={filters.areaRangeHa[0]} onChange={(e) => setFilters({ areaRangeHa: [Number(e.target.value), filters.areaRangeHa[1]] })} />
          <span>–</span>
          <input type="number" className="w-24 sm:w-28 rounded border-gray-300" value={filters.areaRangeHa[1]} onChange={(e) => setFilters({ areaRangeHa: [filters.areaRangeHa[0], Number(e.target.value)] })} />
        </div>
      </div>

      
          <option value="true">{t('filters.yes')}</option>
          <option value="false">{t('filters.no')}</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-gray-600">{t('filters.score')}</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="number" className="w-20 sm:w-24 rounded border-gray-300" value={filters.scoreRange[0]} onChange={(e) => setFilters({ scoreRange: [Number(e.target.value), filters.scoreRange[1]] })} />
          <span>–</span>
          <input type="number" className="w-20 sm:w-24 rounded border-gray-300" value={filters.scoreRange[1]} onChange={(e) => setFilters({ scoreRange: [filters.scoreRange[0], Number(e.target.value)] })} />
        </div>
      </div>
    </div>
  );
};

export default Filters;


