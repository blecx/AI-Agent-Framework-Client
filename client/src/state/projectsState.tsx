/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { Project } from '../types';
import {
  defaultProjectsState,
  projectsReducer,
  type ProjectsState,
} from './projectsSlice';

interface ProjectsContextValue {
  state: ProjectsState;
  actions: {
    setLoading: () => void;
    setError: (error: string) => void;
    setProjects: (projects: Project[]) => void;
    reset: () => void;
  };
}

const ProjectsStateContext = createContext<ProjectsContextValue | undefined>(
  undefined,
);

export function ProjectsStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectsReducer, defaultProjectsState);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      state,
      actions: {
        setLoading: () => dispatch({ type: 'setLoading' }),
        setError: (error: string) => dispatch({ type: 'setError', error }),
        setProjects: (projects: Project[]) =>
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
