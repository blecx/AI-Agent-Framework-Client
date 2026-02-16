/**
 * i18next Configuration
 * 
 * Configures i18next with:
 * - English and German translation resources
 * - Browser language detection with English fallback
 * - React integration via react-i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './i18n.en.json';
import deTranslations from './i18n.de.json';

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Translation resources
    resources: {
      en: {
        translation: enTranslations,
      },
      de: {
        translation: deTranslations,
      },
    },
    // Default language
    fallbackLng: 'en',
    // Supported languages
    supportedLngs: ['en', 'de'],
    // Debug mode (disable in production)
    debug: import.meta.env.DEV && import.meta.env.MODE !== 'test',
    // Interpolation settings
    interpolation: {
      // React already escapes by default
      escapeValue: false,
    },
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['navigator', 'htmlTag', 'localStorage'],
      // Cache user language preference
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
