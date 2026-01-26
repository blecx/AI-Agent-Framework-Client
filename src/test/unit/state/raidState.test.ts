import { describe, it, expect } from 'vitest';
import { raidReducer, type RaidState } from '../../../state/raidState';
import {
  RAIDImpactLevel,
  RAIDLikelihood,
  RAIDPriority,
  RAIDStatus,
  RAIDType,
  type RAIDItem,
  type RAIDItemList,
} from '../../../types/api';
import { createAsyncSlice } from '../../../state/types';

describe('raidState', () => {
  const initialState: RaidState = {
    raidItems: createAsyncSlice<RAIDItemList>({ items: [], total: 0 }),
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
    const item: RAIDItem = {
      id: '1',
      project_key: 'P1',
      type: RAIDType.RISK,
      title: 'Risk 1',
      description: 'Risk description',
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.HIGH,
      impact: RAIDImpactLevel.HIGH,
      likelihood: RAIDLikelihood.POSSIBLE,
      created_at: 'now',
      updated_at: 'now',
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
    const item: RAIDItem = {
      id: '1',
      project_key: 'P1',
      type: RAIDType.ISSUE,
      title: 'Issue 1',
      description: 'Issue description',
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.MEDIUM,
      created_at: 'now',
      updated_at: 'now',
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
