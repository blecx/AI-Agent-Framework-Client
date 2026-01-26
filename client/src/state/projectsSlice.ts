import type { Project } from '../types';
import type { AsyncSlice } from './types';
import { createAsyncSlice } from './types';

export interface ProjectsState {
  projects: AsyncSlice<Project[]>;
}

type ProjectsAction =
  | { type: 'setLoading' }
  | { type: 'setError'; error: string }
  | { type: 'setProjects'; projects: Project[] }
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
      return { projects: createAsyncSlice<Project[]>([]) };
    default:
      return state;
  }
}

export const defaultProjectsState: ProjectsState = {
  projects: createAsyncSlice<Project[]>([]),
};
