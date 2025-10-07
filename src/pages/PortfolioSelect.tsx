import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PortfolioSelect: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
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
          
          <button 
            onClick={toggleLang} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            {i18n.language === 'ka' ? (
              <>
                <span className="text-xl">🇬🇧</span>
                <span>{t('lang.en')}</span>
              </>
            ) : (
              <>
                <span className="text-xl">🇬🇪</span>
                <span>{t('lang.ka')}</span>
              </>
            )}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white mb-6 shadow-lg">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {t('portfolio.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('portfolio.subtitle')}
          </p>
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
