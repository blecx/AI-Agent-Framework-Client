import type { AsyncSlice } from './types';
import { createAsyncSlice } from './types';

export const WORKFLOW_STATES = {
  PLANNING: 'PLANNING',
  EXECUTING: 'EXECUTING',
  CLOSED: 'CLOSED',
} as const;

export type WorkflowStateEnum =
  (typeof WORKFLOW_STATES)[keyof typeof WORKFLOW_STATES];

export interface WorkflowState {
  projectKey: string;
  currentState: WorkflowStateEnum;
  allowedTransitions: WorkflowStateEnum[];
  updatedAt: string;
}

export interface AllowedTransitions {
  projectKey: string;
  currentState: WorkflowStateEnum;
  allowedTransitions: WorkflowStateEnum[];
}

export interface WorkflowSliceState {
  workflow: AsyncSlice<WorkflowState | null>;
  allowedTransitions: AsyncSlice<AllowedTransitions | null>;
}

type WorkflowTarget = 'workflow' | 'allowedTransitions';

type WorkflowAction =
  | { type: 'setLoading'; target: WorkflowTarget }
  | { type: 'setError'; target: WorkflowTarget; error: string }
  | { type: 'setWorkflow'; workflow: WorkflowState | null }
  | {
      type: 'setAllowedTransitions';
      allowedTransitions: AllowedTransitions | null;
    }
  | { type: 'reset' };

export function workflowReducer(
  state: WorkflowSliceState,
  action: WorkflowAction,
): WorkflowSliceState {
  switch (action.type) {
    case 'setLoading':
      if (action.target === 'workflow') {
        return {
          ...state,
          workflow: { ...state.workflow, status: 'loading', error: null },
        };
      }
      return {
        ...state,
        allowedTransitions: {
          ...state.allowedTransitions,
          status: 'loading',
          error: null,
        },
      };
    case 'setError':
      if (action.target === 'workflow') {
        return {
          ...state,
          workflow: { ...state.workflow, status: 'error', error: action.error },
        };
      }
      return {
        ...state,
        allowedTransitions: {
          ...state.allowedTransitions,
          status: 'error',
          error: action.error,
        },
      };
    case 'setWorkflow':
      return {
        ...state,
        workflow: { status: 'success', data: action.workflow, error: null },
      };
    case 'setAllowedTransitions':
      return {
        ...state,
        allowedTransitions: {
          status: 'success',
          data: action.allowedTransitions,
          error: null,
        },
      };
    case 'reset':
      return {
        workflow: createAsyncSlice<WorkflowState | null>(null),
        allowedTransitions: createAsyncSlice<AllowedTransitions | null>(null),
      };
    default:
      return state;
  }
}

export const defaultWorkflowState: WorkflowSliceState = {
  workflow: createAsyncSlice<WorkflowState | null>(null),
  allowedTransitions: createAsyncSlice<AllowedTransitions | null>(null),
};
