/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import {
  defaultWorkflowState,
  workflowReducer,
  type AllowedTransitions,
  type WorkflowSliceState,
  type WorkflowState,
} from './workflowSlice';

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
  const [state, dispatch] = useReducer(workflowReducer, defaultWorkflowState);

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
