import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(next);
  };

  const portals = [
    {
      id: 'bank',
      title: t('landing.bank'),
      description: t('landing.bankDesc'),
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      id: 'insurance',
      title: t('landing.insurance'),
      description: t('landing.insuranceDesc'),
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-700',
      hoverGradient: 'hover:from-green-600 hover:to-green-800',
    },
    {
      id: 'government',
      title: t('landing.government'),
      description: t('landing.governmentDesc'),
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-800',
    },
  ];

  const handlePortalClick = (portalId: string) => {
    if (portalId === 'bank') {
      navigate('/portfolio-select');
    } else {
      navigate('/login', { state: { portal: portalId } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6 animate-fade-in">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('landing.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {portals.map((portal, index) => (
            <button
              key={portal.id}
              onClick={() => handlePortalClick(portal.id)}
              className={`group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${portal.gradient} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {portal.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {portal.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {portal.description}
              </p>

              {/* Arrow Icon */}
              <div className="mt-6 flex items-center justify-center">
                <div className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${portal.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                  <span>{t('landing.enter')}</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>{t('landing.footer')}</p>
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

export default Landing;
