'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, supportedLanguages } from '@/locales';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [i18nInstance, setI18nInstance] = useState<typeof i18n | null>(null);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // Ensure resources and supportedLanguages are properly defined
        const safeResources = resources || {
          en: { translation: {} },
          zh: { translation: {} }
        };

        const safeSupportedLanguages = supportedLanguages || ['en', 'zh'];

        if (!i18n.isInitialized) {
          await i18n
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
        }

        setI18nInstance(i18n);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Still set as ready to render without translations
        setIsReady(true);
      }
    };

    initI18n();
  }, []);

  // Show loading until i18n is ready
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading NutriLoop...</p>
        </div>
      </div>
    );
  }

  // If i18n instance is available, use it
  if (i18nInstance) {
    return (
      <I18nextProvider i18n={i18nInstance}>
        {children}
      </I18nextProvider>
    );
  }

  // Fallback: render without i18n
  return <>{children}</>;
}
