import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PortfolioSelect: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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

  const portfolios = [
    {
      id: 'cb',
      title: 'CB',
      fullName: t('portfolio.cbFull'),
      description: t('portfolio.cbDesc'),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-600',
      stats: t('portfolio.cbStats'),
    },
    {
      id: 'sme',
      title: 'SME',
      fullName: t('portfolio.smeFull'),
      description: t('portfolio.smeDesc'),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      stats: t('portfolio.smeStats'),
    },
    {
      id: 'board',
      title: 'BOARD',
      fullName: t('portfolio.boardFull'),
      description: t('portfolio.boardDesc'),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-indigo-600',
      stats: t('portfolio.boardStats'),
    },
  ];

  const handlePortfolioSelect = (portfolioId: string) => {
    navigate('/login', { state: { portal: 'bank', portfolio: portfolioId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header with Back and Language */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{t('portfolio.back')}</span>
          </button>
          
          <div className="relative z-[1000]">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[1000]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                      {i18n.language === lang.code && (
                        <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
        </div>

        {/* Portfolio Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {portfolios.map((portfolio, index) => (
            <button
              key={portfolio.id}
              onClick={() => handlePortfolioSelect(portfolio.id)}
              className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 text-left animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${portfolio.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br ${portfolio.gradient} text-white mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                {portfolio.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {portfolio.title}
              </h2>
              <p className="text-sm font-medium text-gray-500 mb-3">
                {portfolio.fullName}
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {portfolio.description}
              </p>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{t('portfolio.statsLabel')}</p>
                <p className="text-sm font-semibold text-gray-700">
                  {portfolio.stats}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute bottom-6 right-6">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${portfolio.gradient} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
};

export default PortfolioSelect;
