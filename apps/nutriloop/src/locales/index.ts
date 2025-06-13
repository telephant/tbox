import en from './en/translation.json';
import zh from './zh/translation.json';

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

export const supportedLanguages = ['en', 'zh'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageNames = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese', nativeName: '中文' },
} as const;
