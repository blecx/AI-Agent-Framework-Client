import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUiPreferences,
  saveUiPreferences,
} from '../../../state/uiPreferences';

describe('uiPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default preferences when nothing is stored', () => {
    const prefs = loadUiPreferences();
    expect(prefs.sidebarCollapsed).toBe(false);
  });

  it('loads stored preferences and merges defaults', () => {
    localStorage.setItem(
      'aiaf.uiPreferences.v1',
      JSON.stringify({ sidebarCollapsed: true }),
    );

    const prefs = loadUiPreferences();
    expect(prefs.sidebarCollapsed).toBe(true);
  });

  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem('aiaf.uiPreferences.v1', '{not valid json');

    const prefs = loadUiPreferences();
    expect(prefs.sidebarCollapsed).toBe(false);
  });

  it('saves preferences to localStorage', () => {
    saveUiPreferences({ sidebarCollapsed: true });

    const stored = localStorage.getItem('aiaf.uiPreferences.v1');
    expect(stored).toContain('sidebarCollapsed');
    expect(JSON.parse(stored || '{}')).toEqual({ sidebarCollapsed: true });
  });
});
