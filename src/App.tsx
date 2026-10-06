import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Targeting from './pages/Targeting';
import Audit from './pages/Audit';
import GridCalculator from './pages/GridCalculator';
import Landing from './pages/Landing';
import NewLanding from './pages/NewLanding';
import PlaceOrder from './pages/PlaceOrder';
import MonitoringPage from './pages/MonitoringPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OrchardCashFlowPage from './pages/OrchardCashFlowPage';
import PortfolioSelect from './pages/PortfolioSelect';
import FieldVisitAlternative from './pages/FieldVisitAlternative';
import Login from './pages/Login';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from './lib/i18n';
import { useAppStore } from './lib/store';

const LoginRoute: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  // If user lands on /login while already authenticated, honor ?next= so
  // flows like Place Order -> /login?next=/monitoring still reach their target.
  const url = new URL(window.location.href);
  const next = url.searchParams.get('next');
  if (isAuthenticated) return <Navigate to={next || '/dashboard'} replace />;
  return <Login />;
};

// Entry point that reads a language slug (/ka, /en, /ru and their
// /field-visit-augmentation variants) and switches the UI language before
// rendering the page. The initial hard-load language is set flush at i18n init
// (see lib/i18n.ts); this effect covers in-app navigation to a slugged URL.
// The chosen language then carries into subsequent navigations (which use the
// plain, un-prefixed routes). An unknown slug just falls back to the page.
const LangSlugRoute: React.FC<{ element: React.ReactNode; fallback: string }> = ({
  element,
  fallback,
}) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const valid = !!lang && SUPPORTED_LANGS.includes(lang);

  React.useEffect(() => {
    if (valid && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, valid, i18n]);

  if (!valid) return <Navigate to={fallback} replace />;
  return <>{element}</>;
};

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
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const languages = [
    { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLangChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangDropdownOpen(false);
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
            <div className="relative z-[1000]">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm font-medium hidden sm:inline">{currentLang.label}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[999]"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1000]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                        {i18n.language === lang.code && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
      <Route path="/" element={isAuthenticated ? <Navigate to="/monitoring" replace /> : <NewLanding />} />
      <Route path="/portals" element={<Landing />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route path="/portfolio-select" element={<PortfolioSelect />} />
      <Route path="/field-visit-augmentation" element={<FieldVisitAlternative />} />
      {/* Language-slug entry points — only for home and field-visit pages */}
      <Route
        path="/:lang/field-visit-augmentation"
        element={<LangSlugRoute element={<FieldVisitAlternative />} fallback="/field-visit-augmentation" />}
      />
      <Route path="/:lang" element={<LangSlugRoute element={<NewLanding />} fallback="/" />} />
      <Route path="/login" element={<LoginRoute isAuthenticated={isAuthenticated} />} />

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
      <Route
        path="/grid-calculator"
        element={
          <ProtectedRoute>
            <AuthLayout>
              <GridCalculator />
            </AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MonitoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring/orchard-cash-flow"
        element={
          <ProtectedRoute>
            <OrchardCashFlowPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;


