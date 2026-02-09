/**
 * i18n Translation Catalog Tests
 * 
 * Validates structure and completeness of translation JSON files.
 */

import { describe, it, expect } from 'vitest';
import enTranslations from './i18n.en.json';
import deTranslations from './i18n.de.json';

describe('i18n Translation Catalogs', () => {
  describe('English (en) translations', () => {
    it('should have valid JSON structure', () => {
      expect(enTranslations).toBeDefined();
      expect(typeof enTranslations).toBe('object');
    });

    it('should not be empty', () => {
      expect(Object.keys(enTranslations).length).toBeGreaterThan(0);
    });

    it('should have string values for all keys', () => {
      const checkStrings = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            checkStrings(value, currentPath);
          } else {
            expect(typeof value).toBe('string');
          }
        });
      };
      checkStrings(enTranslations);
    });
  });

  describe('German (de) translations', () => {
    it('should have valid JSON structure', () => {
      expect(deTranslations).toBeDefined();
      expect(typeof deTranslations).toBe('object');
    });

    it('should not be empty', () => {
      expect(Object.keys(deTranslations).length).toBeGreaterThan(0);
    });

    it('should have string values for all keys', () => {
      const checkStrings = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            checkStrings(value, currentPath);
          } else {
            expect(typeof value).toBe('string');
          }
        });
      };
      checkStrings(deTranslations);
    });
  });

  describe('Translation completeness', () => {
    it('should have matching top-level keys between en and de', () => {
      const enKeys = Object.keys(enTranslations).sort();
      const deKeys = Object.keys(deTranslations).sort();
      
      expect(enKeys).toEqual(deKeys);
    });

    it('should have consistent nested key structure', () => {
      const getKeys = (obj: any, prefix = ''): string[] => {
        return Object.entries(obj).flatMap(([key, value]) => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            return getKeys(value, path);
          }
          return [path];
        });
      };

      const enPaths = getKeys(enTranslations).sort();
      const dePaths = getKeys(deTranslations).sort();

      // Check that both have the same translation keys
      expect(enPaths).toEqual(dePaths);
    });

    it('should not have empty translation strings', () => {
      const checkNoEmpty = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            checkNoEmpty(value, currentPath);
          } else {
            expect(value).not.toBe('');
            expect(value.trim().length).toBeGreaterThan(0);
          }
        });
      };

      checkNoEmpty(enTranslations);
      checkNoEmpty(deTranslations);
    });
  });
});
