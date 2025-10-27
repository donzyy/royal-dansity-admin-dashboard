import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import deTranslations from './locales/de.json';
import nlTranslations from './locales/nl.json';
import hiTranslations from './locales/hi.json';
import jaTranslations from './locales/ja.json';
import zhTranslations from './locales/zh.json';

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
  de: { translation: deTranslations },
  nl: { translation: nlTranslations },
  hi: { translation: hiTranslations },
  ja: { translation: jaTranslations },
  zh: { translation: zhTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
