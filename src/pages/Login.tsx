import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const setAuth = useAppStore((state) => state.setAuth);

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
  };

  const portal = (location.state as any)?.portal || 'bank';
  const portfolio = (location.state as any)?.portfolio || 'cb';

  const [email, setEmail] = useState('demo@telagri.com');
  const [password, setPassword] = useState('demo2024');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAuth({
        isAuthenticated: true,
        portal,
        portfolio,
        email,
      });
      navigate('/dashboard');
    }, 1000);
  };

  const getPortalInfo = () => {
    switch (portal) {
      case 'bank':
        return {
          title: t('login.bankTitle'),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          ),
          gradient: 'from-blue-500 to-blue-700',
        };
      case 'insurance':
        return {
          title: t('login.insuranceTitle'),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          gradient: 'from-green-500 to-green-700',
        };
      case 'government':
        return {
          title: t('login.governmentTitle'),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          gradient: 'from-purple-500 to-purple-700',
        };
      default:
        return {
          title: t('login.defaultTitle'),
          icon: null,
          gradient: 'from-gray-500 to-gray-700',
        };
    }
  };

  const portalInfo = getPortalInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header with Back and Language */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{t('login.back')}</span>
          </button>
          
          <button 
            onClick={toggleLang} 
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {i18n.language === 'ka' ? (
              <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-blue-600 text-white text-sm font-bold">EN</span>
            ) : (
              <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-red-600 text-white text-sm font-bold">KA</span>
            )}
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${portalInfo.gradient} p-8 text-white text-center`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 mb-4">
              {portalInfo.icon}
            </div>
            <h1 className="text-2xl font-bold mb-2">{portalInfo.title}</h1>
            {portal === 'bank' && (
              <p className="text-blue-100 text-sm">
                {t('login.portfolio')}: <span className="font-semibold">{portfolio.toUpperCase()}</span>
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8">
            {/* Demo Notice */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    {t('login.demoNotice')}
                  </p>
                  <p className="text-xs text-amber-700">
                    {t('login.demoText')}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="demo@telagri.com"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r ${portalInfo.gradient} text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('login.signingIn')}</span>
                </div>
              ) : (
                t('login.signIn')
              )}
            </button>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>{t('login.help')}</p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>{t('login.footer')}</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
