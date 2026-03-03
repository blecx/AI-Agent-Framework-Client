/**
 * i18next Configuration
 * 
 * Configures i18next with:
 * - English translation resources (strictly enforced for now)
 * - React integration via react-i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './i18n.en.json';

// Configure i18next
i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    lng: 'en',
    // Translation resources
    resources: {
      en: {
        translation: enTranslations,
      }
    },
    // Default language
    fallbackLng: 'en',
    // Supported languages
    supportedLngs: ['en'],
    // Debug mode (disable in production)
    debug: false,
    // Interpolation settings
    interpolation: {
      // React already escapes by default
      escapeValue: false,
    }
  });

export default i18n;
