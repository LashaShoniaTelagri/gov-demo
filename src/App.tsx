import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Targeting from './pages/Targeting';
import Audit from './pages/Audit';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-brand rounded" />
            <h1 className="text-lg font-semibold text-gray-800">{t('app.title')}</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <button onClick={toggleLang} className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
              {i18n.language === 'ka' ? t('lang.en') : t('lang.ka')}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/targeting" element={<Targeting />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;


