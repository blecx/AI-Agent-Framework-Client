import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

interface UiPreferencesContextValue {
  preferences: UiPreferences;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetPreferences: () => void;
}

const UiPreferencesContext = createContext<
  UiPreferencesContextValue | undefined
>(undefined);

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UiPreferences>(() =>
    loadUiPreferences(),
  );

  useEffect(() => {
    saveUiPreferences(preferences);
  }, [preferences]);

  const value = useMemo<UiPreferencesContextValue>(
    () => ({
      preferences,
      setSidebarCollapsed: (collapsed: boolean) =>
        setPreferences((prev) => ({ ...prev, sidebarCollapsed: collapsed })),
      resetPreferences: () => setPreferences(defaultPreferences),
    }),
    [preferences],
  );

  return (
    <UiPreferencesContext.Provider value={value}>
      {children}
    </UiPreferencesContext.Provider>
  );
}

export function useUiPreferences(): UiPreferencesContextValue {
  const context = useContext(UiPreferencesContext);
  if (!context) {
    throw new Error(
      'useUiPreferences must be used within UiPreferencesProvider',
    );
  }
  return context;
}
