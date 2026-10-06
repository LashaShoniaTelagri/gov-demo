import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ka from '../locales/ka.json';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

export const SUPPORTED_LANGS = ['ka', 'en', 'ru'];

// A demo link can carry a language slug as the first path segment
// (/ka, /en, /ru and their /field-visit-augmentation variants). Read it here,
// before React's first render, so the initial paint is already in the right
// language (no flash, and avoids react-i18next's mid-mount re-render pitfall).
function detectInitialLang(): string {
  const seg = window.location.pathname.split('/')[1];
  return SUPPORTED_LANGS.includes(seg) ? seg : 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ka: { translation: ka },
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: detectInitialLang(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;


