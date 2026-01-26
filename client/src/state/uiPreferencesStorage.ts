export interface UiPreferences {
  sidebarCollapsed: boolean;
}

const STORAGE_KEY = 'aiaf.uiPreferences.v1';

const defaultPreferences: UiPreferences = {
  sidebarCollapsed: false,
};

export function loadUiPreferences(): UiPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;

    const parsed = JSON.parse(raw) as Partial<UiPreferences>;
    return {
      ...defaultPreferences,
      ...parsed,
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveUiPreferences(preferences: UiPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // ignore (storage may be unavailable)
  }
}

export function getDefaultUiPreferences(): UiPreferences {
  return defaultPreferences;
}
