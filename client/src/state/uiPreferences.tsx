/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getDefaultUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  type UiPreferences,
} from './uiPreferencesStorage';

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
      resetPreferences: () => setPreferences(getDefaultUiPreferences()),
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
