import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { RAIDItem, RAIDItemList } from '../types/api';
import { AsyncSlice, createAsyncSlice } from './types';

export interface RaidState {
  raidItems: AsyncSlice<RAIDItemList>;
}

type RaidAction =
  | { type: 'setLoading' }
  | { type: 'setError'; error: string }
  | { type: 'setItems'; items: RAIDItem[]; total?: number }
  | { type: 'reset' };

export function raidReducer(state: RaidState, action: RaidAction): RaidState {
  switch (action.type) {
    case 'setLoading':
      return {
        ...state,
        raidItems: { ...state.raidItems, status: 'loading', error: null },
      };
    case 'setError':
      return {
        ...state,
        raidItems: { ...state.raidItems, status: 'error', error: action.error },
      };
    case 'setItems':
      return {
        ...state,
        raidItems: {
          status: 'success',
          error: null,
          data: {
            items: action.items,
            total: action.total ?? action.items.length,
          },
        },
      };
    case 'reset':
      return {
        raidItems: createAsyncSlice<RAIDItemList>({ items: [], total: 0 }),
      };
    default:
      return state;
  }
}

const defaultState: RaidState = {
  raidItems: createAsyncSlice<RAIDItemList>({ items: [], total: 0 }),
};

interface RaidContextValue {
  state: RaidState;
  actions: {
    setLoading: () => void;
    setError: (error: string) => void;
    setItems: (items: RAIDItem[], total?: number) => void;
    reset: () => void;
  };
}

const RaidStateContext = createContext<RaidContextValue | undefined>(undefined);

export function RaidStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(raidReducer, defaultState);

  const value = useMemo<RaidContextValue>(
    () => ({
      state,
      actions: {
        setLoading: () => dispatch({ type: 'setLoading' }),
        setError: (error: string) => dispatch({ type: 'setError', error }),
        setItems: (items: RAIDItem[], total?: number) =>
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
