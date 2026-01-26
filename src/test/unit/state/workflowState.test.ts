import { describe, it, expect } from 'vitest';
import {
  workflowReducer,
  type WorkflowSliceState,
} from '../../../state/workflowState';
import {
  WorkflowStateEnum,
  type AllowedTransitions,
  type WorkflowState,
} from '../../../types/api';
import { createAsyncSlice } from '../../../state/types';

describe('workflowState', () => {
  const initialState: WorkflowSliceState = {
    workflow: createAsyncSlice<WorkflowState | null>(null),
    allowedTransitions: createAsyncSlice<AllowedTransitions | null>(null),
  };

  it('sets workflow loading', () => {
    const next = workflowReducer(initialState, {
      type: 'setLoading',
      target: 'workflow',
    });

    expect(next.workflow.status).toBe('loading');
    expect(next.workflow.error).toBe(null);
    expect(next.allowedTransitions.status).toBe('idle');
  });

  it('sets allowedTransitions loading', () => {
    const next = workflowReducer(initialState, {
      type: 'setLoading',
      target: 'allowedTransitions',
    });

    expect(next.allowedTransitions.status).toBe('loading');
    expect(next.allowedTransitions.error).toBe(null);
    expect(next.workflow.status).toBe('idle');
  });

  it('sets workflow error', () => {
    const next = workflowReducer(initialState, {
      type: 'setError',
      target: 'workflow',
      error: 'Nope',
    });

    expect(next.workflow.status).toBe('error');
    expect(next.workflow.error).toBe('Nope');
  });

  it('sets allowedTransitions error', () => {
    const next = workflowReducer(initialState, {
      type: 'setError',
      target: 'allowedTransitions',
      error: 'Nope',
    });

    expect(next.allowedTransitions.status).toBe('error');
    expect(next.allowedTransitions.error).toBe('Nope');
  });

  it('sets workflow data and success status', () => {
    const workflow: WorkflowState = {
      project_key: 'P1',
      current_state: WorkflowStateEnum.PLANNING,
      allowed_transitions: [WorkflowStateEnum.EXECUTING],
      updated_at: 'now',
    };

    const next = workflowReducer(initialState, {
      type: 'setWorkflow',
      workflow,
    });

    expect(next.workflow.status).toBe('success');
    expect(next.workflow.data?.current_state).toBe(WorkflowStateEnum.PLANNING);
    expect(next.workflow.error).toBe(null);
  });

  it('sets allowed transitions data and success status', () => {
    const allowed: AllowedTransitions = {
      project_key: 'P1',
      current_state: WorkflowStateEnum.PLANNING,
      allowed_transitions: [WorkflowStateEnum.EXECUTING],
    };

    const next = workflowReducer(initialState, {
      type: 'setAllowedTransitions',
      allowedTransitions: allowed,
    });

    expect(next.allowedTransitions.status).toBe('success');
    expect(next.allowedTransitions.data?.allowed_transitions).toEqual([
      WorkflowStateEnum.EXECUTING,
    ]);
    expect(next.allowedTransitions.error).toBe(null);
  });

  it('resets both slices to defaults', () => {
    const loaded: WorkflowSliceState = {
      workflow: {
        status: 'success',
        data: {
          project_key: 'P1',
          current_state: WorkflowStateEnum.CLOSED,
          allowed_transitions: [],
          updated_at: 'now',
        },
        error: null,
      },
      allowedTransitions: {
        status: 'success',
        data: {
          project_key: 'P1',
          current_state: WorkflowStateEnum.CLOSED,
          allowed_transitions: [],
        },
        error: null,
      },
    };

    const next = workflowReducer(loaded, { type: 'reset' });
    expect(next.workflow.status).toBe('idle');
    expect(next.workflow.data).toBe(null);
    expect(next.allowedTransitions.status).toBe('idle');
    expect(next.allowedTransitions.data).toBe(null);
  });
});
