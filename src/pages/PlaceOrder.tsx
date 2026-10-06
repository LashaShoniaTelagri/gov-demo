import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GridMap, { GridCellSelection } from '../components/GridMap';
import {
  GRID_SOURCES,
  REGIONS_BY_COUNTRY,
  type CountryCode,
} from '../lib/gridCalculator';
import { translateRegion } from '../lib/regionTranslations';
import { calculatePrice, type ServiceType } from '../lib/pricing';
import { submitOrder } from '../lib/orderApi';
import DemoLoginModal from '../components/DemoLoginModal';

const CROPS_AVAILABLE = ['Apple', 'Peach'] as const;
type Crop = (typeof CROPS_AVAILABLE)[number];

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const formatUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const PlaceOrder: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [country, setCountry] = useState<CountryCode>('georgia');
  const source = GRID_SOURCES[country];
  const regions = REGIONS_BY_COUNTRY[country];

  const [region, setRegion] = useState<string>(regions[0]);
  const [selections, setSelections] = useState<GridCellSelection[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [langOpen, setLangOpen] = useState(false);
  const [cropsOpen, setCropsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[1];

  const selectedCellIds = useMemo(
    () => new Set(selections.map((s) => s.cellId)),
    [selections],
  );

  const totalAreaHa = useMemo(
    () => selections.reduce((sum, s) => sum + s.area, 0),
    [selections],
  );

  const pricing = useMemo(
    () =>
      serviceType
        ? calculatePrice({ areaHa: totalAreaHa, crops, serviceType })
        : null,
    [totalAreaHa, crops, serviceType],
  );

  const handleCountryChange = (next: CountryCode) => {
    setCountry(next);
    setRegion(REGIONS_BY_COUNTRY[next][0]);
    setSelections([]);
  };

  const toggleCell = (cell: GridCellSelection) => {
    setSelections((prev) =>
      prev.some((s) => s.cellId === cell.cellId)
        ? prev.filter((s) => s.cellId !== cell.cellId)
        : [...prev, cell],
    );
  };

  const toggleCrop = (crop: Crop) => {
    setCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  };

  const toggleAllCrops = () => {
    setCrops((prev) =>
      prev.length === CROPS_AVAILABLE.length ? [] : [...CROPS_AVAILABLE],
    );
  };

  const hasAllFields =
    totalAreaHa > 0 && crops.length > 0 && serviceType !== null;
  const canSubmit = hasAllFields && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !pricing || !serviceType) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitOrder({
        selectedCellIds: selections.map((s) => s.cellId),
        totalAreaHa,
        crops,
        serviceType,
        expectedPriceUsd: pricing.total,
        submittedAt: new Date().toISOString(),
      });
      if (res.ok) {
        setSuccess(res.orderId ?? 'ok');
      } else {
        setError(res.error ?? 'Submit failed');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setSuccess(null);
    setSelections([]);
    setCrops([]);
    setServiceType(null);
  };

  const proceedToLogin = () => {
    setSuccess(null);
    setLoginOpen(true);
  };

  const allCropsSelected = crops.length === CROPS_AVAILABLE.length;
  const cropLabel =
    crops.length === 0
      ? t('placeOrder.cropsPlaceholder')
      : crops
          .map((c) => t(`placeOrder.cropNames.${c.toLowerCase()}`))
          .join(', ');

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-[380px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-5 space-y-5">
          <div className="flex justify-end">
            <div className="relative z-[1001]">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                <span className="text-base">{currentLang.flag}</span>
                <span className="font-medium">{currentLang.label}</span>
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
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
                        <span className="text-base">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {t('placeOrder.title')}
            </h1>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('placeOrder.country')}
            </label>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="georgia">{t('grid.countries.georgia')}</option>
              <option
                value="uzbekistan"
                disabled={!GRID_SOURCES.uzbekistan.available}
              >
                {t('grid.countries.uzbekistan')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('placeOrder.regionFilter')}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {translateRegion(r, i18n.language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('placeOrder.crops')}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCropsOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:border-gray-400"
              >
                <span className={crops.length === 0 ? 'text-gray-400' : ''}>
                  {cropLabel}
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
              {cropsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[1000]"
                    onClick={() => setCropsOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1001]">
                    <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <input
                        type="checkbox"
                        checked={allCropsSelected}
                        onChange={toggleAllCrops}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-medium text-gray-700">
                        {t('placeOrder.selectAll')}
                      </span>
                    </label>
                    {CROPS_AVAILABLE.map((c) => (
                      <label
                        key={c}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={crops.includes(c)}
                          onChange={() => toggleCrop(c)}
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
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {t('placeOrder.serviceType')}
            </label>
            <div className="space-y-2">
              {(['one-time', 'annual'] as ServiceType[]).map((s) => {
                const active = serviceType === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setServiceType(s)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${
                          active
                            ? 'border-blue-600 bg-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-400'
                        }`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {t(`placeOrder.service.${s}.title`)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {t(`placeOrder.service.${s}.info`)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('placeOrder.selectedArea')}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-3xl font-bold text-gray-900 tabular-nums">
                {totalAreaHa.toLocaleString('en-US', {
                  maximumFractionDigits: 1,
                })}
              </div>
              <div className="text-sm font-semibold text-gray-500">ha</div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {selections.length > 0
                ? t('placeOrder.cellsSelected', { count: selections.length })
                : t('placeOrder.areaHint')}
            </p>
          </div>

          {hasAllFields && pricing && (
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('placeOrder.totalPrice')}
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
                {formatUsd(pricing.total)}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                {t('placeOrder.priceNote')}
              </p>
            </div>
          )}

          {serviceType && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
              <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                {t('placeOrder.deliveryTime')}
              </div>
              {serviceType === 'annual' ? (
                <>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    {t('placeOrder.delivery.annual1')}
                  </p>
                  {t('placeOrder.delivery.annual2') && (
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {t('placeOrder.delivery.annual2')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-blue-900 leading-relaxed">
                  {t('placeOrder.delivery.oneTime')}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
              canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? t('placeOrder.submitting') : t('placeOrder.submit')}
          </button>

          {selections.length > 0 && (
            <button
              type="button"
              onClick={() => setSelections([])}
              className="w-full text-xs text-gray-500 hover:text-red-600"
            >
              {t('placeOrder.clearSelection')}
            </button>
          )}
        </div>
      </aside>

      <section className="flex-1 relative">
        <GridMap
          source={source}
          selectedCellIds={selectedCellIds}
          onCellToggle={toggleCell}
          focusRegion={region}
          mapId={`place-order-map-${country}`}
        />
      </section>

      {success && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t('placeOrder.successTitle')}
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              {t('placeOrder.successMessage')}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={proceedToLogin}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                {t('placeOrder.continueToLogin')}
              </button>
              <button
                onClick={closeSuccess}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                {t('placeOrder.successClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DemoLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default PlaceOrder;
