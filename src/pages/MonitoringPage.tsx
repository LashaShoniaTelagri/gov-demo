import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';
import FieldsMap from '../components/FieldsMap';
import {
  ALL_CROPS,
  SCORE_BUCKETS,
  fetchFields,
  scoreBucket,
  type Crop,
  type FieldFeature,
  type FieldFeatureCollection,
  type MonitoringCountry,
  type ScoreBucket,
} from '../lib/fieldsData';
import { REGIONS_BY_COUNTRY } from '../lib/gridCalculator';
import { translateRegion, translateMunicipality } from '../lib/regionTranslations';
import {
  deletePortfolio,
  listPortfolios,
  savePortfolio,
  type Portfolio,
} from '../lib/portfolios';
import EvaluationModal from '../components/EvaluationModal';

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const MonitoringPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);

  const [country, setCountry] = useState<MonitoringCountry>('georgia');
  const regionsForCountry = REGIONS_BY_COUNTRY[country];
  const [fields, setFields] = useState<FieldFeatureCollection | null>(null);
  // Region & Municipality are multi-select. Empty array = no filter (show all).
  const [region, setRegion] = useState<string[]>([]);
  const [regionFilterOpen, setRegionFilterOpen] = useState(false);
  const [municipality, setMunicipality] = useState<string[]>([]);
  const [municipalityFilterOpen, setMunicipalityFilterOpen] = useState(false);
  const [cropFilter, setCropFilter] = useState<Crop[]>([]);
  const [cropFilterOpen, setCropFilterOpen] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<'all' | ScoreBucket>('all');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set());

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [clickedField, setClickedField] = useState<FieldFeature | null>(null);
  const [emptyPicker, setEmptyPicker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // Synthetic field shown in EvaluationModal after picking a crop on an
  // unevaluated location — uses the mid-bucket template per spec.
  const [emptyResult, setEmptyResult] = useState<FieldFeature | null>(null);
  const [savePrompt, setSavePrompt] = useState<{
    source: 'selection' | 'filter';
    ids: string[];
  } | null>(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Leaflet needs to re-measure its container when the sidebar width changes.
    // Wait for the CSS transition (200ms) before firing so the map picks up the final size.
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 230);
    return () => window.clearTimeout(id);
  }, [sidebarOpen]);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[1];

  useEffect(() => {
    setPortfolios(listPortfolios());
  }, []);

  useEffect(() => {
    setFields(null);
    fetchFields(country)
      .then(setFields)
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('fields load failed', err);
      });
    // Reset filters + selection when country changes so we don't carry stale
    // state (Kakheti region value, Georgia field IDs) into the other country.
    setRegion([]);
    setMunicipality([]);
    setCropFilter([]);
    setScoreFilter('all');
    setMinArea('');
    setMaxArea('');
    setSelectionMode(false);
    setSelectedFieldIds(new Set());
  }, [country]);

  const filtersActive =
    region.length > 0 ||
    municipality.length > 0 ||
    cropFilter.length > 0 ||
    scoreFilter !== 'all' ||
    minArea !== '' ||
    maxArea !== '';

  // Municipality options narrow to the currently selected regions; if no
  // region is selected we surface every municipality present in the dataset.
  const municipalityOptions = useMemo(() => {
    if (!fields) return [];
    const set = new Set<string>();
    for (const f of fields.features) {
      if (region.length > 0 && !region.includes(f.properties.region)) continue;
      const m = f.properties.municipality;
      if (m) set.add(m);
    }
    return Array.from(set).sort();
  }, [fields, region]);

  const filtered = useMemo<FieldFeature[]>(() => {
    if (!fields) return [];
    const minN = minArea === '' ? -Infinity : Number(minArea);
    const maxN = maxArea === '' ? Infinity : Number(maxArea);
    return fields.features.filter((f) => {
      const p = f.properties;
      if (region.length > 0 && !region.includes(p.region)) return false;
      if (
        municipality.length > 0 &&
        (!p.municipality || !municipality.includes(p.municipality))
      )
        return false;
      // Cell-level markers have no crop; they should remain visible regardless
      // of the crop filter so the user keeps spatial context.
      if (cropFilter.length > 0 && p.crop && !cropFilter.includes(p.crop))
        return false;
      if (
        scoreFilter !== 'all' &&
        !p.is_cell &&
        scoreBucket(p.score) !== scoreFilter
      )
        return false;
      if (p.area_ha < minN || p.area_ha > maxN) return false;
      return true;
    });
  }, [fields, region, municipality, cropFilter, scoreFilter, minArea, maxArea]);

  const visibleFieldIds = useMemo(
    () => new Set(filtered.map((f) => f.properties.field_id)),
    [filtered],
  );

  const resetFilters = () => {
    setRegion([]);
    setMunicipality([]);
    setCropFilter([]);
    setScoreFilter('all');
    setMinArea('');
    setMaxArea('');
  };

  const toggleSelect = (fieldId: string) => {
    setSelectedFieldIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const handleFieldClick = (f: FieldFeature) => {
    if (selectionMode) {
      toggleSelect(f.properties.field_id);
      return;
    }
    // Cell-level markers aren't real analyzed fields — treat a click like an
    // empty-area click so the user picks a crop and gets a sample score.
    if (f.properties.is_cell) {
      setEmptyPicker({ lat: 0, lng: 0 });
      return;
    }
    setClickedField(f);
  };

  const handleEmptyClick = (latlng: { lat: number; lng: number }) => {
    if (selectionMode) return;
    setEmptyPicker(latlng);
  };

  const confirmEmptyCrop = (crop: Crop) => {
    // Per spec: unevaluated clicks always show the mid-bucket evaluation.
    // Score is randomized inside 4.0–6.9 to avoid an identical readout each
    // time. Area is a plausible ~5–20 ha sample.
    const score = Math.round((Math.random() * 2.9 + 4) * 10) / 10;
    const area = Math.round((Math.random() * 15 + 5) * 10) / 10;
    const synthetic: FieldFeature = {
      type: 'Feature',
      properties: {
        field_id: `SAMPLE-${Date.now().toString(36)}`,
        cell_id: null,
        crop,
        is_cell: false,
        score,
        area_ha: area,
        region: country === 'georgia' ? 'Kakheti' : 'Fergana',
        municipality: country === 'georgia' ? 'Telavi' : 'Furkat',
      },
      geometry: { type: 'Point', coordinates: [0, 0] },
    };
    setEmptyPicker(null);
    setEmptyResult(synthetic);
  };

  const startSelection = () => {
    setSelectionMode(true);
    setSelectedFieldIds(new Set());
  };

  const openSaveFromSelection = () => {
    if (selectedFieldIds.size === 0) return;
    setSavePrompt({ source: 'selection', ids: [...selectedFieldIds] });
  };

  const openSaveFromFilter = () => {
    const ids = filtered.map((f) => f.properties.field_id);
    if (ids.length === 0) return;
    setSavePrompt({ source: 'filter', ids });
  };

  const confirmSave = () => {
    if (!savePrompt || !portfolioName.trim()) return;
    savePortfolio(portfolioName.trim(), savePrompt.ids);
    setPortfolios(listPortfolios());
    setSavePrompt(null);
    setPortfolioName('');
    setSelectionMode(false);
    setSelectedFieldIds(new Set());
    showToast(t('monitoring.toast.saved'));
  };

  const handleDelete = (id: string) => {
    deletePortfolio(id);
    setPortfolios(listPortfolios());
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      <aside
        className={`${
          sidebarOpen ? 'w-[400px]' : 'w-0'
        } shrink-0 bg-white border-r border-gray-200 overflow-y-auto transition-[width] duration-200`}
      >
        <div className={`p-5 space-y-5 ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
            >
              {t('login.logout')}
            </button>
            <div className="flex items-center gap-2">
            <div className="relative z-[1001]">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
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
                    {LANGUAGES.map((lang) => (
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
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {t('monitoring.title')}
            </h1>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('monitoring.country')}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as MonitoringCountry)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option value="georgia">{t('grid.countries.georgia')}</option>
              <option value="uzbekistan">
                {t('grid.countries.uzbekistan')}
              </option>
            </select>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {t('monitoring.filters.title')}
              </h2>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  {t('monitoring.filters.reset')}
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('monitoring.filters.region')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRegionFilterOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-gray-400"
                >
                  <span className={region.length === 0 ? 'text-gray-400' : ''}>
                    {region.length === 0
                      ? t('monitoring.filters.all')
                      : region
                          .map((r) => translateRegion(r, i18n.language))
                          .join(', ')}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {regionFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[1000]"
                      onClick={() => setRegionFilterOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001] max-h-64 overflow-y-auto">
                      <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={region.length === regionsForCountry.length}
                          onChange={() =>
                            setRegion((prev) =>
                              prev.length === regionsForCountry.length
                                ? []
                                : [...regionsForCountry],
                            )
                          }
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="font-medium text-gray-700">
                          {t('placeOrder.selectAll')}
                        </span>
                      </label>
                      {regionsForCountry.map((r) => (
                        <label
                          key={r}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={region.includes(r)}
                            onChange={() =>
                              setRegion((prev) => {
                                if (prev.includes(r)) {
                                  // Removing a region also drops any municipality
                                  // that no longer belongs to a selected region.
                                  return prev.filter((x) => x !== r);
                                }
                                return [...prev, r];
                              })
                            }
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-gray-800">
                            {translateRegion(r, i18n.language)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('monitoring.filters.municipality')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMunicipalityFilterOpen((v) => !v)}
                  disabled={municipalityOptions.length === 0}
                  className="w-full flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span
                    className={municipality.length === 0 ? 'text-gray-400' : ''}
                  >
                    {municipality.length === 0
                      ? t('monitoring.filters.all')
                      : municipality
                          .map((m) => translateMunicipality(m, i18n.language))
                          .join(', ')}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {municipalityFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[1000]"
                      onClick={() => setMunicipalityFilterOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001] max-h-64 overflow-y-auto">
                      <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={
                            municipalityOptions.length > 0 &&
                            municipality.length === municipalityOptions.length
                          }
                          onChange={() =>
                            setMunicipality((prev) =>
                              prev.length === municipalityOptions.length
                                ? []
                                : [...municipalityOptions],
                            )
                          }
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="font-medium text-gray-700">
                          {t('placeOrder.selectAll')}
                        </span>
                      </label>
                      {municipalityOptions.map((m) => (
                        <label
                          key={m}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={municipality.includes(m)}
                            onChange={() =>
                              setMunicipality((prev) =>
                                prev.includes(m)
                                  ? prev.filter((x) => x !== m)
                                  : [...prev, m],
                              )
                            }
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-gray-800">
                            {translateMunicipality(m, i18n.language)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('monitoring.filters.crop')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCropFilterOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-gray-400"
                >
                  <span className={cropFilter.length === 0 ? 'text-gray-400' : ''}>
                    {cropFilter.length === 0
                      ? t('monitoring.filters.all')
                      : cropFilter
                          .map((c) =>
                            t(`placeOrder.cropNames.${c.toLowerCase()}`),
                          )
                          .join(', ')}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {cropFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[1000]"
                      onClick={() => setCropFilterOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001]">
                      <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={cropFilter.length === ALL_CROPS.length}
                          onChange={() =>
                            setCropFilter((prev) =>
                              prev.length === ALL_CROPS.length
                                ? []
                                : [...ALL_CROPS],
                            )
                          }
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="font-medium text-gray-700">
                          {t('placeOrder.selectAll')}
                        </span>
                      </label>
                      {ALL_CROPS.map((c) => (
                        <label
                          key={c}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={cropFilter.includes(c)}
                            onChange={() =>
                              setCropFilter((prev) =>
                                prev.includes(c)
                                  ? prev.filter((x) => x !== c)
                                  : [...prev, c],
                              )
                            }
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-gray-800">
                            {t(`placeOrder.cropNames.${c.toLowerCase()}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('monitoring.filters.score')}
              </label>
              <select
                value={String(scoreFilter)}
                onChange={(e) =>
                  setScoreFilter(
                    e.target.value === 'all'
                      ? 'all'
                      : (e.target.value as ScoreBucket),
                  )
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
              >
                <option value="all">{t('monitoring.filters.all')}</option>
                {SCORE_BUCKETS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {t(`monitoring.filters.score${b.id.charAt(0).toUpperCase()}${b.id.slice(1)}`)}
                    {' '}({b.range[0]}–{b.range[1]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t('monitoring.filters.area')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  placeholder={t('monitoring.filters.min')}
                  className="w-1/2 rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                />
                <input
                  type="number"
                  min={0}
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  placeholder={t('monitoring.filters.max')}
                  className="w-1/2 rounded border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            {filtersActive && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {t('monitoring.filters.resultsTitle')}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded border border-gray-200 bg-white px-3 py-2 text-xs">
                  {region.length > 0 && (
                    <>
                      <dt className="text-gray-500">
                        {t('monitoring.filters.region')}
                      </dt>
                      <dd className="font-medium text-gray-800 text-right tabular-nums">
                        {region.length}
                      </dd>
                    </>
                  )}
                  {municipality.length > 0 && (
                    <>
                      <dt className="text-gray-500">
                        {t('monitoring.filters.municipality')}
                      </dt>
                      <dd className="font-medium text-gray-800 text-right tabular-nums">
                        {municipality.length}
                      </dd>
                    </>
                  )}
                  {cropFilter.length > 0 && (
                    <>
                      <dt className="text-gray-500">
                        {t('monitoring.filters.crop')}
                      </dt>
                      <dd className="font-medium text-gray-800 text-right tabular-nums">
                        {cropFilter.length}
                      </dd>
                    </>
                  )}
                  {scoreFilter !== 'all' && (
                    <>
                      <dt className="text-gray-500">
                        {t('monitoring.filters.score')}
                      </dt>
                      <dd className="font-medium text-gray-800 text-right">
                        {t(`monitoring.filters.score${scoreFilter.charAt(0).toUpperCase()}${scoreFilter.slice(1)}`)}
                      </dd>
                    </>
                  )}
                  {(minArea !== '' || maxArea !== '') && (
                    <>
                      <dt className="text-gray-500">
                        {t('monitoring.filters.area')}
                      </dt>
                      <dd className="font-medium text-gray-800 text-right">
                        {minArea === '' ? '0' : Number(minArea).toLocaleString()}
                        {' – '}
                        {maxArea === '' ? '∞' : Number(maxArea).toLocaleString()}
                      </dd>
                    </>
                  )}
                  <dt className="text-gray-500 border-t border-gray-100 pt-1 mt-1">
                    {t('monitoring.filters.numberOfFarms')}
                  </dt>
                  <dd className="font-semibold text-gray-900 text-right tabular-nums border-t border-gray-100 pt-1 mt-1">
                    {filtered.length.toLocaleString()}
                  </dd>
                </dl>
                <button
                  onClick={openSaveFromFilter}
                  disabled={filtered.length === 0}
                  className={`w-full rounded-lg text-sm py-2 ${
                    filtered.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {t('monitoring.createFromFilter')}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {t('monitoring.selection.title')}
              </h2>
              {!selectionMode ? (
                <button
                  onClick={startSelection}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  {t('monitoring.selection.start')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedFieldIds(new Set());
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-red-600"
                >
                  {t('monitoring.selection.cancel')}
                </button>
              )}
            </div>

            {selectionMode ? (
              <>
                <p className="text-xs text-gray-500">
                  {t('monitoring.selection.instructions')}
                </p>
                <div className="max-h-32 overflow-y-auto rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-700">
                  {selectedFieldIds.size === 0
                    ? t('monitoring.selection.empty')
                    : [...selectedFieldIds].map((id) => (
                        <div key={id} className="py-0.5">
                          #{id}
                        </div>
                      ))}
                </div>
                <button
                  onClick={openSaveFromSelection}
                  disabled={selectedFieldIds.size === 0}
                  className={`w-full rounded-lg text-sm py-2 ${
                    selectedFieldIds.size === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t('monitoring.selection.save', {
                    count: selectedFieldIds.size,
                  })}
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                {t('monitoring.selection.hint')}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-700">
                  {t('monitoring.uploadKmz.title')}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {t('monitoring.uploadKmz.body')}
                </p>
              </div>
              <button
                onClick={() => setAttachOpen(true)}
                className="w-9 h-9 shrink-0 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                title={t('monitoring.uploadKmz.button')}
                aria-label={t('monitoring.uploadKmz.button')}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {t('monitoring.portfolios.title')}
            </h2>
            {portfolios.length === 0 ? (
              <p className="text-xs text-gray-500">
                {t('monitoring.portfolios.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {portfolios.map((p) => (
                  <li key={p.id} className="py-2 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('monitoring.portfolios.fields', {
                          count: p.fieldIds.length,
                        })}
                      </div>
                    </div>
                    <button
                      title={t('monitoring.portfolios.kmz')}
                      onClick={() => showToast(t('monitoring.toast.kmzUnavailable'))}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                      aria-label={t('monitoring.portfolios.kmz')}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-5l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      KMZ
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-8 h-8 rounded-full border border-red-200 bg-white text-red-500 hover:bg-red-50 flex items-center justify-center"
                      title={t('monitoring.portfolios.delete')}
                      aria-label={t('monitoring.portfolios.delete')}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-700">
                  {t('monitoring.analyticsBox.title')}
                </h2>
              </div>
              <button
                onClick={() => navigate('/monitoring/analytics')}
                className="w-9 h-9 shrink-0 rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                title={t('monitoring.analyticsBox.open')}
                aria-label={t('monitoring.analyticsBox.open')}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-1 relative">
        <FieldsMap
          fields={fields}
          visibleFieldIds={visibleFieldIds}
          selectedFieldIds={selectedFieldIds}
          selectionMode={selectionMode}
          country={country}
          onFieldClick={handleFieldClick}
          onEmptyClick={handleEmptyClick}
          mapId={`fields-map-${country}`}
        />
      </section>

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        title={
          sidebarOpen
            ? t('monitoring.sidebar.collapse')
            : t('monitoring.sidebar.expand')
        }
        aria-label={
          sidebarOpen
            ? t('monitoring.sidebar.collapse')
            : t('monitoring.sidebar.expand')
        }
        style={{ left: sidebarOpen ? 388 : 0 }}
        className="absolute top-1/2 -translate-y-1/2 z-[500] w-8 h-16 rounded-r-lg bg-white shadow-lg border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-[left] duration-200"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {clickedField && (
        <EvaluationModal
          field={clickedField}
          onClose={() => setClickedField(null)}
        />
      )}

      {emptyPicker && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
          onClick={() => setEmptyPicker(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {t('monitoring.empty.title')}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t('monitoring.empty.prompt')}
            </p>
            <div className="flex flex-col gap-2">
              {ALL_CROPS.map((c) => (
                <button
                  key={c}
                  onClick={() => confirmEmptyCrop(c)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  {t(`placeOrder.cropNames.${c.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {emptyResult && (
        <EvaluationModal
          field={emptyResult}
          onClose={() => setEmptyResult(null)}
        />
      )}

      {savePrompt && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
          onClick={() => setSavePrompt(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {t('monitoring.save.title')}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {t('monitoring.save.count', { count: savePrompt.ids.length })}
            </p>
            <input
              autoFocus
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder={t('monitoring.save.placeholder')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSavePrompt(null)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                {t('monitoring.save.cancel')}
              </button>
              <button
                onClick={confirmSave}
                disabled={!portfolioName.trim()}
                className={`px-4 py-2 rounded text-white text-sm ${
                  portfolioName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {t('monitoring.save.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {attachOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
          onClick={() => {
            setAttachOpen(false);
            setAttachFile(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {t('monitoring.attach.title')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('monitoring.attach.message')}
            </p>

            <label
              htmlFor="attach-kmz-file"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 p-5 transition-colors mb-4"
            >
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l-4-4m4 4l4-4M3 20h18"
                />
              </svg>
              <div className="text-sm font-medium text-gray-700">
                {attachFile
                  ? attachFile.name
                  : t('monitoring.attach.chooseFile')}
              </div>
              <div className="text-xs text-gray-500">
                {t('monitoring.attach.fileHint')}
              </div>
              <input
                id="attach-kmz-file"
                type="file"
                accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml"
                className="hidden"
                onChange={(e) =>
                  setAttachFile(e.target.files?.[0] ?? null)
                }
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setAttachOpen(false);
                  setAttachFile(null);
                }}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                {t('monitoring.attach.close')}
              </button>
              <button
                disabled={!attachFile}
                onClick={() => {
                  showToast(
                    t('monitoring.attach.attached', {
                      name: attachFile?.name ?? '',
                    }),
                  );
                  setAttachOpen(false);
                  setAttachFile(null);
                }}
                className={`px-4 py-2 rounded text-white text-sm ${
                  attachFile
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {t('monitoring.attach.attach')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2100] bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default MonitoringPage;
