import { describe, it, expect } from 'vitest';
import {
  WORKFLOW_STATES,
  workflowReducer,
  type AllowedTransitions,
  type WorkflowSliceState,
  type WorkflowState,
} from '../../../state/workflowSlice';
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
      projectKey: 'P1',
      currentState: WORKFLOW_STATES.PLANNING,
      allowedTransitions: [WORKFLOW_STATES.EXECUTING],
      updatedAt: 'now',
    };

    const next = workflowReducer(initialState, {
      type: 'setWorkflow',
      workflow,
    });

    expect(next.workflow.status).toBe('success');
    expect(next.workflow.data?.currentState).toBe(WORKFLOW_STATES.PLANNING);
    expect(next.workflow.error).toBe(null);
  });

  it('sets allowed transitions data and success status', () => {
    const allowed: AllowedTransitions = {
      projectKey: 'P1',
      currentState: WORKFLOW_STATES.PLANNING,
      allowedTransitions: [WORKFLOW_STATES.EXECUTING],
    };

    const next = workflowReducer(initialState, {
      type: 'setAllowedTransitions',
      allowedTransitions: allowed,
    });

    expect(next.allowedTransitions.status).toBe('success');
    expect(next.allowedTransitions.data?.allowedTransitions).toEqual([
      WORKFLOW_STATES.EXECUTING,
    ]);
    expect(next.allowedTransitions.error).toBe(null);
  });

  it('resets both slices to defaults', () => {
    const loaded: WorkflowSliceState = {
      workflow: {
        status: 'success',
        data: {
          projectKey: 'P1',
          currentState: WORKFLOW_STATES.CLOSED,
          allowedTransitions: [],
          updatedAt: 'now',
        },
        error: null,
      },
      allowedTransitions: {
        status: 'success',
        data: {
          projectKey: 'P1',
          currentState: WORKFLOW_STATES.CLOSED,
          allowedTransitions: [],
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
