import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Targeting from './pages/Targeting';
import Audit from './pages/Audit';
import Landing from './pages/Landing';
import PortfolioSelect from './pages/PortfolioSelect';
import Login from './pages/Login';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './lib/store';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const auth = useAppStore((state) => state.auth);
  const logout = useAppStore((state) => state.logout);

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
  };

  const getPortalBranding = () => {
    switch (auth.portal) {
      case 'bank':
        return {
          icon: (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
          ),
          title: t('landing.bank'),
          subtitle: auth.portfolio ? `${t('login.portfolio')}: ${auth.portfolio.toUpperCase()}` : '',
        };
      case 'insurance':
        return {
          icon: (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          ),
          title: t('landing.insurance'),
          subtitle: '', // No RDA label for insurance
        };
      case 'government':
        return {
          icon: (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          ),
          title: t('landing.government'),
          subtitle: t('app.title'), // RDA beneficiaries label
        };
      default:
        return {
          icon: (
            <img src="https://cdn.telagri.com/assets/rda-logo.jpeg" alt="RDA logo" className="h-10 sm:h-12 w-auto" />
          ),
          title: t('app.title'),
          subtitle: '',
        };
    }
  };

  const branding = getPortalBranding();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="w-full pl-[50px] pr-4 sm:pr-6 lg:pr-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.icon}
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{branding.title}</h1>
              {branding.subtitle && (
                <p className="text-xs text-gray-500">{branding.subtitle}</p>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            {auth.email && (
              <span className="text-gray-600 px-3 py-1.5 hidden sm:inline">
                {auth.email}
              </span>
            )}
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
              {i18n.language === 'ka' ? (
                <>
                  <span>🇬🇧</span>
                  <span>{t('lang.en')}</span>
                </>
              ) : (
                <>
                  <span>🇬🇪</span>
                  <span>{t('lang.ka')}</span>
                </>
              )}
            </button>
            <button 
              onClick={logout} 
              className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              {t('login.logout')}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const isAuthenticated = useAppStore((state) => state.auth.isAuthenticated);
  const { i18n, t } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/portfolio-select" element={<PortfolioSelect />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthLayout>
              <Dashboard />
            </AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/targeting"
        element={
          <ProtectedRoute>
            <AuthLayout>
              <Targeting />
            </AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <AuthLayout>
              <Audit />
            </AuthLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;


