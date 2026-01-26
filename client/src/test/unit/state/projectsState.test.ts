import { describe, it, expect } from 'vitest';
import {
  projectsReducer,
  type ProjectsState,
} from '../../../state/projectsSlice';
import { createAsyncSlice } from '../../../state/types';

describe('projectsState', () => {
  const initialState: ProjectsState = {
    projects: createAsyncSlice([]),
  };

  it('sets loading status', () => {
    const next = projectsReducer(initialState, { type: 'setLoading' });
    expect(next.projects.status).toBe('loading');
    expect(next.projects.error).toBe(null);
  });

  it('sets projects data and success status', () => {
    const next = projectsReducer(initialState, {
      type: 'setProjects',
      projects: [
        {
          key: 'P1',
          name: 'Project 1',
          createdAt: 'now',
          updatedAt: 'now',
        },
      ],
    });

    expect(next.projects.status).toBe('success');
    expect(next.projects.data).toHaveLength(1);
    expect(next.projects.error).toBe(null);
  });

  it('sets error status and message', () => {
    const next = projectsReducer(initialState, {
      type: 'setError',
      error: 'Boom',
    });

    expect(next.projects.status).toBe('error');
    expect(next.projects.error).toBe('Boom');
  });

  it('resets to default', () => {
    const loaded: ProjectsState = {
      projects: { status: 'success', data: [], error: null },
    };

    const next = projectsReducer(loaded, { type: 'reset' });
    expect(next.projects.status).toBe('idle');
    expect(next.projects.data).toEqual([]);
  });
});
