import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { langText, type OrchardCondition, type Parcel } from '../lib/fieldVisitCases';

interface FieldVisitPanelProps {
  parcel: Parcel | null;
  matchedCode: string | null;
  notFound: boolean;
  onSearch: (code: string) => void;
}

const CONDITION_BADGE: Record<OrchardCondition, string> = {
  good: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  poor: 'bg-red-100 text-red-800 border-red-300',
};

// Always shown, in this order. The parcel's assigned condition is highlighted;
// the others stay visible but dimmed.
const CONDITIONS: OrchardCondition[] = ['good', 'medium', 'poor'];

const FieldVisitPanel: React.FC<FieldVisitPanelProps> = ({ parcel, matchedCode, notFound, onSearch }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [code, setCode] = useState('');

  // Accepts digits and dots only (cadastral format e.g. 43.12.01.148); rejects
  // alphabetic and other characters.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/[^0-9.]/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(code);
  };

  const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Search */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="text-xl font-bold text-gray-800">{t('fieldVisit.searchHeading')}</h2>
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            {t('fieldVisit.cadastralCode')}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={code}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          {t('fieldVisit.search')}
        </button>
        {notFound && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t('fieldVisit.notFound')}
          </div>
        )}
      </form>

      {/* Parcel data */}
      {parcel && (
        <div className="space-y-1">
          <Field label={t('fieldVisit.cadastralCode')} value={matchedCode ?? parcel.cadastralCodes[0]} />
          <Field label={t('fieldVisit.region')} value={langText(parcel.region, lang)} />
          <Field label={t('fieldVisit.municipality')} value={langText(parcel.municipality, lang)} />
          <Field label={t('fieldVisit.village')} value={langText(parcel.village, lang)} />
          <Field label={t('fieldVisit.cadastralArea')} value={parcel.cadastralAreaHa} />
          <Field label={t('fieldVisit.crop')} value={langText(parcel.crop, lang)} />
          <Field
            label={t('fieldVisit.orchardAge')}
            value={<span className="whitespace-pre-line">{langText(parcel.orchardAge, lang)}</span>}
          />
          <Field label={t('fieldVisit.plantedArea')} value={parcel.plantedAreaHa} />
          <Field label={t('fieldVisit.healthyArea')} value={parcel.healthyAreaHa} />
          <Field label={t('fieldVisit.lowProductivityArea')} value={parcel.lowProductivityAreaHa} />

          <div className="py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('fieldVisit.orchardCondition')}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONDITIONS.map((c) => {
                const selected = c === parcel.condition;
                return (
                  <span
                    key={c}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${CONDITION_BADGE[c]} ${
                      selected ? 'ring-2 ring-offset-1 ring-current' : 'opacity-40'
                    }`}
                  >
                    {selected && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {t(`fieldVisit.condition.${c}`)}
                    {selected && parcel.conditionScore != null && ` - ${parcel.conditionScore}`}
                  </span>
                );
              })}
            </div>
          </div>
          <Field label={t('fieldVisit.evaluationDate')} value={parcel.evaluationDate} />
        </div>
      )}

      {/* PDF download */}
      <a
        href={parcel ? parcel.pdfUrl : undefined}
        download={parcel ? `${matchedCode ?? parcel.cadastralCodes[0]}.pdf` : undefined}
        aria-disabled={!parcel}
        className={`block w-full text-center rounded-lg py-2.5 text-sm font-semibold ${
          parcel
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
      >
        {t('fieldVisit.downloadFile')}
      </a>
    </div>
  );
};

export default FieldVisitPanel;
