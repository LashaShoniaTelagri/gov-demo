import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DemoLoginModal from '../components/DemoLoginModal';

const NewLanding: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);

  const languages = [
    { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentLang =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLangChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const cards = [
    {
      id: 'place-order',
      title: t('newLanding.placeOrder'),
      icon: (
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7.5l9-4.5 9 4.5M3 7.5v9l9 4.5m-9-13.5l9 4.5m0 0l9-4.5m-9 4.5v9"
          />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-700',
      onClick: () => {},
      disabled: true,
    },
    {
      id: 'field-visit',
      title: t('newLanding.fieldVisit'),
      icon: (
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-700',
      onClick: () => navigate('/field-visit-augmentation'),
      disabled: false,
    },
    {
      id: 'login',
      title: t('newLanding.login'),
      icon: (
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      ),
      gradient: 'from-indigo-500 to-blue-700',
      onClick: () => setLoginOpen(true),
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="flex justify-end mb-6 animate-fade-in">
          <div className="relative z-[1000]">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <span className="text-xl">{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
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
                        i18n.language === lang.code
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            {t('newLanding.title')}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={card.onClick}
              disabled={card.disabled}
              className={`group relative bg-white rounded-2xl shadow-xl transition-all duration-300 p-8 text-center animate-slide-up ${
                card.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-2xl transform hover:-translate-y-2'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
              />
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} text-white mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {card.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {card.title}
              </h2>
              <div className="mt-6 flex items-center justify-center">
                <div
                  className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}
                >
                  <span>{t('newLanding.enter')}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>{t('landing.footer')}</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out backwards; }
      `}</style>

      <DemoLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default NewLanding;
