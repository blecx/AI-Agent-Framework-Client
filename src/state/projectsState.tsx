import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { ProjectInfo } from '../types/api';
import { AsyncSlice, createAsyncSlice } from './types';

export interface ProjectsState {
  projects: AsyncSlice<ProjectInfo[]>;
}

type ProjectsAction =
  | { type: 'setLoading' }
  | { type: 'setError'; error: string }
  | { type: 'setProjects'; projects: ProjectInfo[] }
  | { type: 'reset' };

export function projectsReducer(
  state: ProjectsState,
  action: ProjectsAction,
): ProjectsState {
  switch (action.type) {
    case 'setLoading':
      return {
        ...state,
        projects: { ...state.projects, status: 'loading', error: null },
      };
    case 'setError':
      return {
        ...state,
        projects: { ...state.projects, status: 'error', error: action.error },
      };
    case 'setProjects':
      return {
        ...state,
        projects: {
          status: 'success',
          data: action.projects,
          error: null,
        },
      };
    case 'reset':
      return { projects: createAsyncSlice<ProjectInfo[]>([]) };
    default:
      return state;
  }
}

const defaultState: ProjectsState = {
  projects: createAsyncSlice<ProjectInfo[]>([]),
};

interface ProjectsContextValue {
  state: ProjectsState;
  actions: {
    setLoading: () => void;
    setError: (error: string) => void;
    setProjects: (projects: ProjectInfo[]) => void;
    reset: () => void;
  };
}

const ProjectsStateContext = createContext<ProjectsContextValue | undefined>(
  undefined,
);

export function ProjectsStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectsReducer, defaultState);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      state,
      actions: {
        setLoading: () => dispatch({ type: 'setLoading' }),
        setError: (error: string) => dispatch({ type: 'setError', error }),
        setProjects: (projects: ProjectInfo[]) =>
          dispatch({ type: 'setProjects', projects }),
        reset: () => dispatch({ type: 'reset' }),
      },
    }),
    [state],
  );

  return (
    <ProjectsStateContext.Provider value={value}>
      {children}
    </ProjectsStateContext.Provider>
  );
}

export function useProjectsState(): ProjectsContextValue {
  const context = useContext(ProjectsStateContext);
  if (!context) {
    throw new Error(
      'useProjectsState must be used within ProjectsStateProvider',
    );
  }
  return context;
}
