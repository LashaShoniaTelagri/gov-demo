import React from 'react';
import Map from '../components/Map';
import LayerToggles from '../components/LayerToggles';
import Filters from '../components/Filters';
import KpiCards from '../components/KpiCards';
import OrchardDrawer from '../components/OrchardDrawer';
import ExecutiveMetrics from '../components/ExecutiveMetrics';
import ExecutiveCharts from '../components/ExecutiveCharts';
import PortfolioDashboard from './PortfolioDashboard';
import { useAppStore } from '../lib/store';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { ui, setUI, auth } = useAppStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [boardView, setBoardView] = React.useState<'executive' | 'portfolio'>('executive');
  const [portfolioTab, setPortfolioTab] = React.useState<'cb' | 'sme' | 'all'>('all');
  
  // Check if user is a BOARD member (executive view)
  const isExecutiveView = auth.portfolio === 'board';
  
  // Check if user is CB or SME (portfolio monitoring view)
  const isPortfolioView = auth.portfolio === 'cb' || auth.portfolio === 'sme';

  // Portfolio Monitoring View (CB/SME)
  if (isPortfolioView) {
    return <PortfolioDashboard />;
  }

  // Executive Dashboard View (BOARD) - with portfolio monitoring option
  if (isExecutiveView) {
    // Show portfolio monitoring view if selected
    if (boardView === 'portfolio') {
      return (
        <div className="h-screen flex flex-col overflow-hidden">
          {/* View Toggle */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setBoardView('executive')}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                >
                  📊 {t('executive.executiveView')}
                </button>
                <button
                  onClick={() => setBoardView('portfolio')}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white shadow-md font-medium"
                >
                  🗺️ {t('executive.portfolioMonitoring')}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPortfolioTab('all')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    portfolioTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('executive.allPortfolios')}
                </button>
                <button
                  onClick={() => setPortfolioTab('cb')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    portfolioTab === 'cb'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('executive.cbPortfolio')}
                </button>
                <button
                  onClick={() => setPortfolioTab('sme')}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    portfolioTab === 'sme'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('executive.smePortfolio')}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <PortfolioDashboard portfolioFilter={portfolioTab} />
          </div>
        </div>
      );
    }
    
    // Show executive metrics view
    return (
      <div className="h-[calc(100vh-56px)] overflow-y-auto">
        <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* View Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setBoardView('executive')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg font-semibold"
            >
              📊 {t('executive.executiveView')}
            </button>
            <button
              onClick={() => setBoardView('portfolio')}
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
            >
              🗺️ {t('executive.portfolioMonitoring')}
            </button>
          </div>

          {/* Executive Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('executive.dashboard')}</h1>
                <p className="text-indigo-100 text-lg">{t('executive.subtitle')}</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-indigo-100">{t('executive.lastUpdated')}</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Metrics */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('executive.keyMetrics')}</h2>
            <ExecutiveMetrics />
          </div>

          {/* Executive Charts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('executive.analytics')}</h2>
            <ExecutiveCharts />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('executive.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-blue-600">{t('executive.generateReport')}</span>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-green-600">{t('executive.viewDetails')}</span>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-purple-600">{t('executive.configure')}</span>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-orange-600">{t('executive.exportData')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Dashboard View (for CB and SME portfolios)
  return (
    <div className="h-[calc(100vh-56px)] p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
      {/* Mobile controls */}
      <div className="sm:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 bg-white"
        >
          {mobileFiltersOpen ? t('common.hide') : t('filters.title')}
        </button>
        {ui.showRightPanel && (
          <button
            onClick={() => setUI({ showRightPanel: false })}
            className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 bg-white"
          >
            {t('panel.right')}
          </button>
        )}
      </div>

      {/* Mobile filters drawer (collapsible) */}
      {mobileFiltersOpen && (
        <div className="sm:hidden space-y-3">
          <Filters />
          <LayerToggles />
          <KpiCards />
        </div>
      )}

      {/* Desktop left sidebar */}
      <aside className={`hidden sm:block space-y-4 transition-all duration-200 ${ui.showLeftPanel ? 'sm:col-span-3 opacity-100' : 'sm:col-span-1 opacity-70'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t('filters.title')}</span>
          <button className="text-xs text-gray-600 underline" onClick={() => setUI({ showLeftPanel: !ui.showLeftPanel })}>
            {ui.showLeftPanel ? t('common.hide') : t('common.show')}
          </button>
        </div>
        {ui.showLeftPanel && (
          <>
            <Filters />
            <LayerToggles />
            <KpiCards />
          </>
        )}
      </aside>

      {/* Map section */}
      <section className={`${ui.showLeftPanel ? (ui.showRightPanel ? 'sm:col-span-6' : 'sm:col-span-9') : (ui.showRightPanel ? 'sm:col-span-8' : 'sm:col-span-11')} relative min-h-[60vh] sm:min-h-0`}>
        <div className="h-full rounded-lg overflow-hidden border border-gray-200 relative">
          <Map />
          {/* Mobile overlay drawer when an orchard is selected */}
          <div className="sm:hidden">
            {ui.showRightPanel && <OrchardDrawer />}
          </div>
        </div>
      </section>

      {/* Desktop right drawer */}
      {ui.showRightPanel && (
        <aside className={`hidden sm:block ${ui.showLeftPanel ? 'sm:col-span-3' : 'sm:col-span-3'} transition-all duration-200`}>
          <div className="h-full">
            <OrchardDrawer embedded />
          </div>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;


