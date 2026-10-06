import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';
import { findParcel, getCaseById, type Parcel } from '../lib/fieldVisitCases';
import FieldVisitLogin from '../components/FieldVisitLogin';
import FieldVisitPanel from '../components/FieldVisitPanel';
import FieldVisitMap from '../components/FieldVisitMap';

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const FieldVisitAlternative: React.FC = () => {
  const { t, i18n } = useTranslation();
  const demoAuth = useAppStore((s) => s.demoAuth);
  const setDemoAuth = useAppStore((s) => s.setDemoAuth);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [matchedCode, setMatchedCode] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const caseObj = getCaseById(demoAuth.caseId);

  // Not authenticated (or the persisted caseId is unknown) → show the login gate.
  if (!caseObj) {
    return <FieldVisitLogin />;
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleSearch = (code: string) => {
    const match = findParcel(caseObj.id, code);
    if (match) {
      setSelectedParcel(match.parcel);
      setMatchedCode(match.matchedCode);
      setNotFound(false);
    } else {
      setSelectedParcel(null);
      setMatchedCode(null);
      setNotFound(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">{t('newLanding.fieldVisit')}</h1>
          <div className="flex items-center gap-2">
            <div className="relative z-[1000]">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
              >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm font-medium hidden sm:inline">{currentLang.label}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-[999]" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1000]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 ${
                          i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setDemoAuth({ caseId: undefined })}
              className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
            >
              {t('login.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <aside className="w-full md:w-96 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white h-64 md:h-auto">
          <FieldVisitPanel
            parcel={selectedParcel}
            matchedCode={matchedCode}
            notFound={notFound}
            onSearch={handleSearch}
          />
        </aside>
        <main className="flex-1 min-h-0">
          <FieldVisitMap
            mapConfig={caseObj.map}
            selectedParcel={selectedParcel}
            matchedCode={matchedCode}
          />
        </main>
      </div>
    </div>
  );
};

export default FieldVisitAlternative;
