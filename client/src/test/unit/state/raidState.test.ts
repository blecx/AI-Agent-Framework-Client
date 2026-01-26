import { describe, it, expect } from 'vitest';
import {
  raidReducer,
  type RaidItem,
  type RaidItemList,
  type RaidState,
} from '../../../state/raidSlice';
import { createAsyncSlice } from '../../../state/types';

describe('raidState', () => {
  const initialState: RaidState = {
    raidItems: createAsyncSlice<RaidItemList>({ items: [], total: 0 }),
  };

  it('sets loading status', () => {
    const next = raidReducer(initialState, { type: 'setLoading' });
    expect(next.raidItems.status).toBe('loading');
    expect(next.raidItems.error).toBe(null);
  });

  it('sets error status and message', () => {
    const next = raidReducer(initialState, {
      type: 'setError',
      error: 'Boom',
    });

    expect(next.raidItems.status).toBe('error');
    expect(next.raidItems.error).toBe('Boom');
  });

  it('sets items data and success status', () => {
    const item: RaidItem = {
      id: '1',
      projectKey: 'P1',
      type: 'risk',
      title: 'Risk 1',
      createdAt: 'now',
      updatedAt: 'now',
    };

    const next = raidReducer(initialState, {
      type: 'setItems',
      items: [item],
    });

    expect(next.raidItems.status).toBe('success');
    expect(next.raidItems.error).toBe(null);
    expect(next.raidItems.data.items).toHaveLength(1);
    expect(next.raidItems.data.total).toBe(1);
  });

  it('respects explicit total when setting items', () => {
    const item: RaidItem = {
      id: '1',
      projectKey: 'P1',
      type: 'issue',
      title: 'Issue 1',
      createdAt: 'now',
      updatedAt: 'now',
    };

    const next = raidReducer(initialState, {
      type: 'setItems',
      items: [item],
      total: 42,
    });

    expect(next.raidItems.data.total).toBe(42);
  });

  it('resets to default', () => {
    const loaded: RaidState = {
      raidItems: {
        status: 'success',
        error: null,
        data: { items: [], total: 123 },
      },
    };

    const next = raidReducer(loaded, { type: 'reset' });
    expect(next.raidItems.status).toBe('idle');
    expect(next.raidItems.data).toEqual({ items: [], total: 0 });
  });
});
