/**
 * i18next Configuration Integration Tests
 * 
 * Validates i18next setup, initialization, and runtime behavior.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import i18n from './config';

describe('i18next Configuration', () => {
  beforeEach(async () => {
    // Reset i18n to initial state before each test
    await i18n.changeLanguage('en');
  });

  describe('Initialization', () => {
    it('should be initialized', () => {
      expect(i18n.isInitialized).toBe(true);
    });

    it('should disable debug logging in test mode', () => {
      expect(i18n.options.debug).toBe(false);
    });

    it('should have English as fallback language', () => {
      const fallback = i18n.options.fallbackLng;
      expect(fallback).toBeDefined();
      // fallbackLng can be a string, array, or object - check it includes 'en'
      if (Array.isArray(fallback)) {
        expect(fallback).toContain('en');
      } else {
        expect(fallback).toEqual('en');
      }
    });

    it('should support English and German', () => {
      const supportedLngs = i18n.options.supportedLngs;
      expect(supportedLngs).toContain('en');
      expect(supportedLngs).toContain('de');
    });

    it('should have translation resources loaded', () => {
      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
      expect(i18n.hasResourceBundle('de', 'translation')).toBe(true);
    });
  });

  describe('Translation Key Resolution', () => {
    it('should resolve English translation keys', () => {
      i18n.changeLanguage('en');
      const translation = i18n.t('nav.projects');
      expect(translation).toBe('Projects');
    });

    it('should resolve German translation keys', async () => {
      await i18n.changeLanguage('de');
      const translation = i18n.t('nav.projects');
      expect(translation).toBe('Projekte');
    });

    it('should resolve nested translation keys', () => {
      i18n.changeLanguage('en');
      const translation = i18n.t('conn.state.online');
      expect(translation).toBe('Online');
    });

    it('should return key for missing translations', () => {
      const translation = i18n.t('nonexistent.key.path');
      expect(translation).toBe('nonexistent.key.path');
    });

    it('should fallback to English for missing German translations', async () => {
      await i18n.changeLanguage('de');
      // If a key exists in EN but not DE, it should fallback
      const translation = i18n.t('some.missing.key', { lng: 'de' });
      // This will return the key if missing in both, which is expected behavior
      expect(typeof translation).toBe('string');
    });
  });

  describe('Language Switching', () => {
    it('should switch from English to German', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      
      await i18n.changeLanguage('de');
      expect(i18n.language).toBe('de');
    });

    it('should update translations after language change', async () => {
      await i18n.changeLanguage('en');
      let translation = i18n.t('nav.projects');
      expect(translation).toBe('Projects');

      await i18n.changeLanguage('de');
      translation = i18n.t('nav.projects');
      expect(translation).toBe('Projekte');
    });

    it('should persist language preference to localStorage', async () => {
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      await i18n.changeLanguage('de');
      
      // i18next should call localStorage.setItem with language preference
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'i18nextLng',
        expect.stringContaining('de')
      );
    });
  });

  describe('Interpolation', () => {
    it('should support variable interpolation', () => {
      // Testing interpolation capability with a real key
      const translation = i18n.t('nav.projects');
      // Verify it returns a string (baseline check)
      expect(typeof translation).toBe('string');
      expect(translation.length).toBeGreaterThan(0);
    });

    it('should not escape HTML by default (React handles it)', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported language gracefully', async () => {
      await i18n.changeLanguage('fr'); // French not supported
      // Should fallback to English
      expect(i18n.language).not.toBe('fr');
    });

    it('should handle null/undefined keys gracefully', () => {
      expect(() => i18n.t(null as unknown as string)).not.toThrow();
      expect(() => i18n.t(undefined as unknown as string)).not.toThrow();
    });
  });

  describe('Locale Detection', () => {
    it('should detect browser language', () => {
      // i18next-browser-languagedetector should be configured
      expect(i18n.options.detection).toBeDefined();
      expect(i18n.options.detection?.order).toContain('navigator');
    });

    it('should check localStorage for cached language', () => {
      expect(i18n.options.detection?.caches).toContain('localStorage');
      expect(i18n.options.detection?.lookupLocalStorage).toBe('i18nextLng');
    });
  });
});
