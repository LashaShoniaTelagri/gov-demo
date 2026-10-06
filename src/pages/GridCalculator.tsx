import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GridMap, { GridCellSelection } from '../components/GridMap';
import {
  GRID_SOURCES,
  REGIONS_BY_COUNTRY,
  type CountryCode,
} from '../lib/gridCalculator';
import { translateRegion } from '../lib/regionTranslations';

const GridCalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [country, setCountry] = useState<CountryCode>('georgia');
  const [region, setRegion] = useState<string>(REGIONS_BY_COUNTRY.georgia[0]);
  const [selections, setSelections] = useState<GridCellSelection[]>([]);

  const source = GRID_SOURCES[country];
  const regions = REGIONS_BY_COUNTRY[country];

  const handleCountryChange = (next: CountryCode) => {
    setCountry(next);
    setRegion(REGIONS_BY_COUNTRY[next][0]);
    setSelections([]);
  };

  const toggleCell = (cell: GridCellSelection) => {
    setSelections((prev) => {
      const exists = prev.some((s) => s.cellId === cell.cellId);
      return exists ? prev.filter((s) => s.cellId !== cell.cellId) : [...prev, cell];
    });
  };

  const selectedIds = useMemo(
    () => new Set(selections.map((s) => s.cellId)),
    [selections],
  );

  const totalArea = useMemo(
    () => selections.reduce((sum, s) => sum + s.area, 0),
    [selections],
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-80 bg-white border-r border-gray-200 p-5 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('grid.title')}</h2>

        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {t('grid.country')}
        </label>
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          className="w-full mb-4 rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="georgia">{t('grid.countries.georgia')}</option>
          <option value="uzbekistan" disabled={!GRID_SOURCES.uzbekistan.available}>
            {t('grid.countries.uzbekistan')}
            {!GRID_SOURCES.uzbekistan.available ? ` (${t('grid.comingSoon')})` : ''}
          </option>
        </select>

        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {t('grid.region')}
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full mb-4 rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{translateRegion(r, i18n.language)}</option>
          ))}
        </select>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{t('grid.result')}</h3>
            {selections.length > 0 && (
              <button
                onClick={() => setSelections([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                {t('grid.clearAll')}
              </button>
            )}
          </div>

          {selections.length === 0 ? (
            <p className="text-sm text-gray-500">{t('grid.selectPrompt')}</p>
          ) : (
            <>
              <div className="max-h-40 overflow-y-auto mb-3 rounded border border-gray-200 bg-white divide-y divide-gray-100">
                {selections.map((s, i) => (
                  <div key={s.cellId} className="flex justify-between items-center px-2 py-1 text-xs">
                    <span className="text-gray-500">
                      {t('grid.cell')} #{i + 1}
                    </span>
                    <span className="font-mono text-gray-700">
                      {s.area.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <button
                      onClick={() => toggleCell(s)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                      aria-label="remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('grid.cellsSelected')}</dt>
                  <dd className="font-medium text-gray-800">{selections.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('grid.totalArea')}</dt>
                  <dd className="font-medium text-gray-800">
                    {totalArea.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </aside>

      <section className="flex-1 relative">
        {!source.available && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
            <div className="bg-white border border-gray-200 rounded-lg shadow px-6 py-3 text-sm text-gray-600">
              {t('grid.countryUnavailable')}
            </div>
          </div>
        )}
        <GridMap
          source={source}
          selectedCellIds={selectedIds}
          onCellToggle={toggleCell}
          focusRegion={region}
          mapId={`grid-map-${country}`}
        />
      </section>
    </div>
  );
};

export default GridCalculator;
