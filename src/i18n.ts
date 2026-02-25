import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import teTranslations from './locales/te.json';
import hiTranslations from './locales/hi.json';
import taTranslations from './locales/ta.json';
import knTranslations from './locales/kn.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            es: { translation: esTranslations },
            te: { translation: teTranslations },
            hi: { translation: hiTranslations },
            ta: { translation: taTranslations },
            kn: { translation: knTranslations },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
