import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, supportedLanguages, type SupportedLanguage } from '@/locales';

// Browser language detection function
const detectBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.includes(browserLang as SupportedLanguage) ? browserLang : 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: detectBrowserLanguage(),
    debug: false,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    supportedLngs: supportedLanguages,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
