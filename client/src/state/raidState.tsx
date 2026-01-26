/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import {
  defaultRaidState,
  raidReducer,
  type RaidItem,
  type RaidState,
} from './raidSlice';

interface RaidContextValue {
  state: RaidState;
  actions: {
    setLoading: () => void;
    setError: (error: string) => void;
    setItems: (items: RaidItem[], total?: number) => void;
    reset: () => void;
  };
}

const RaidStateContext = createContext<RaidContextValue | undefined>(undefined);

export function RaidStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(raidReducer, defaultRaidState);

  const value = useMemo<RaidContextValue>(
    () => ({
      state,
      actions: {
        setLoading: () => dispatch({ type: 'setLoading' }),
        setError: (error: string) => dispatch({ type: 'setError', error }),
        setItems: (items: RaidItem[], total?: number) =>
          dispatch({ type: 'setItems', items, total }),
        reset: () => dispatch({ type: 'reset' }),
      },
    }),
    [state],
  );

  return (
    <RaidStateContext.Provider value={value}>
      {children}
    </RaidStateContext.Provider>
  );
}

export function useRaidState(): RaidContextValue {
  const context = useContext(RaidStateContext);
  if (!context) {
    throw new Error('useRaidState must be used within RaidStateProvider');
  }
  return context;
}
