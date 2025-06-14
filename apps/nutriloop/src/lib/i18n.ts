import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, supportedLanguages } from '@/locales';

// Ensure resources and supportedLanguages are properly defined
const safeResources = resources || {
  en: { translation: {} },
  zh: { translation: {} }
};

const safeSupportedLanguages = supportedLanguages || ['en', 'zh'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: safeResources,
    fallbackLng: 'en',
    debug: false,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    supportedLngs: safeSupportedLanguages,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
