import type { AsyncSlice } from './types';
import { createAsyncSlice } from './types';

export type RaidType = 'risk' | 'assumption' | 'issue' | 'dependency';
export type RaidStatus = 'open' | 'closed';
export type RaidPriority = 'low' | 'medium' | 'high';

export interface RaidItem {
  id: string;
  projectKey: string;
  type: RaidType;
  title: string;
  description?: string;
  status?: RaidStatus;
  priority?: RaidPriority;
  createdAt: string;
  updatedAt: string;
}

export interface RaidItemList {
  items: RaidItem[];
  total: number;
}

export interface RaidState {
  raidItems: AsyncSlice<RaidItemList>;
}

type RaidAction =
  | { type: 'setLoading' }
  | { type: 'setError'; error: string }
  | { type: 'setItems'; items: RaidItem[]; total?: number }
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
        raidItems: createAsyncSlice<RaidItemList>({ items: [], total: 0 }),
      };
    default:
      return state;
  }
}

export const defaultRaidState: RaidState = {
  raidItems: createAsyncSlice<RaidItemList>({ items: [], total: 0 }),
};
