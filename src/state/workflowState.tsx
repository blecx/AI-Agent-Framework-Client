import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { AllowedTransitions, WorkflowState } from '../types/api';
import { AsyncSlice, createAsyncSlice } from './types';

export interface WorkflowSliceState {
  workflow: AsyncSlice<WorkflowState | null>;
  allowedTransitions: AsyncSlice<AllowedTransitions | null>;
}

type WorkflowAction =
  | { type: 'setLoading'; target: 'workflow' | 'allowedTransitions' }
  | {
      type: 'setError';
      target: 'workflow' | 'allowedTransitions';
      error: string;
    }
  | {
      type: 'setWorkflow';
      workflow: WorkflowState | null;
    }
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

const defaultState: WorkflowSliceState = {
  workflow: createAsyncSlice<WorkflowState | null>(null),
  allowedTransitions: createAsyncSlice<AllowedTransitions | null>(null),
};

interface WorkflowContextValue {
  state: WorkflowSliceState;
  actions: {
    setWorkflowLoading: () => void;
    setWorkflowError: (error: string) => void;
    setWorkflow: (workflow: WorkflowState | null) => void;
    setAllowedTransitionsLoading: () => void;
    setAllowedTransitionsError: (error: string) => void;
    setAllowedTransitions: (
      allowedTransitions: AllowedTransitions | null,
    ) => void;
    reset: () => void;
  };
}

const WorkflowStateContext = createContext<WorkflowContextValue | undefined>(
  undefined,
);

export function WorkflowStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, defaultState);

  const value = useMemo<WorkflowContextValue>(
    () => ({
      state,
      actions: {
        setWorkflowLoading: () =>
          dispatch({ type: 'setLoading', target: 'workflow' }),
        setWorkflowError: (error: string) =>
          dispatch({ type: 'setError', target: 'workflow', error }),
        setWorkflow: (workflow: WorkflowState | null) =>
          dispatch({ type: 'setWorkflow', workflow }),
        setAllowedTransitionsLoading: () =>
          dispatch({ type: 'setLoading', target: 'allowedTransitions' }),
        setAllowedTransitionsError: (error: string) =>
          dispatch({
            type: 'setError',
            target: 'allowedTransitions',
            error,
          }),
        setAllowedTransitions: (
          allowedTransitions: AllowedTransitions | null,
        ) =>
          dispatch({
            type: 'setAllowedTransitions',
            allowedTransitions,
          }),
        reset: () => dispatch({ type: 'reset' }),
      },
    }),
    [state],
  );

  return (
    <WorkflowStateContext.Provider value={value}>
      {children}
    </WorkflowStateContext.Provider>
  );
}

export function useWorkflowState(): WorkflowContextValue {
  const context = useContext(WorkflowStateContext);
  if (!context) {
    throw new Error(
      'useWorkflowState must be used within WorkflowStateProvider',
    );
  }
  return context;
}
