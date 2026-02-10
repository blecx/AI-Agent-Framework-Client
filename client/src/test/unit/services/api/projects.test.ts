/**
 * Unit tests for ProjectsService with Zod validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { ProjectApiClient } from '../../../../services/ProjectApiClient';
import {
  type Project,
  type CreateProjectRequest,
  ProjectSchema,
} from '../../../../types/project';
import { ValidationError } from '../../../../services/errors';

// Mock axios for ProjectApiClient
vi.mock('axios');

describe('ProjectsService', () => {
  let service: ProjectApiClient;

  const mockProject: Project = {
    key: 'TEST-001',
    name: 'Test Project',
    description: 'Test description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    state: 'active',
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      getValidated: vi.fn(),
      postValidated: vi.fn(),
    };

    service = new ProjectsService(mockClient);
  });

  describe('listProjects', () => {
    it('should fetch and validate list of projects', async () => {
      const projects = [mockProject];
      mockClient.getValidated.mockResolvedValue(projects);

      const result = await service.listProjects();

      expect(mockClient.getValidated).toHaveBeenCalledWith(
        '/api/v1/projects',
        expect.any(z.ZodArray),
      );
      expect(result).toEqual(projects);
    });

    it('should throw ValidationError for invalid project data', async () => {
      const invalidProjects = [{ key: 'TEST', name: 123 }]; // name should be string
      const validationError = createValidationError(
        'Response validation failed',
      );

      mockClient.getValidated.mockRejectedValue(validationError);

      await expect(service.listProjects()).rejects.toMatchObject({
        type: 'validation',
      });
    });
  });

  describe('getProject', () => {
    it('should fetch and validate single project', async () => {
      mockClient.getValidated.mockResolvedValue(mockProject);

      const result = await service.getProject('TEST-001');

      expect(mockClient.getValidated).toHaveBeenCalledWith(
        '/api/v1/projects/TEST-001',
        ProjectInfoSchema,
      );
      expect(result).toEqual(mockProject);
    });
  });

  describe('createProject', () => {
    it('should validate input and create project', async () => {
      const newProject: ProjectCreate = {
        key: 'TEST-002',
        name: 'New Project',
        description: 'New description',
      };

      mockClient.postValidated.mockResolvedValue(mockProject);

      const result = await service.createProject(newProject);

      expect(mockClient.postValidated).toHaveBeenCalledWith(
        '/api/v1/projects',
        newProject,
        ProjectInfoSchema,
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw ValidationError for invalid input', async () => {
      const invalidProject = {
        key: '', // empty key should fail validation
        name: 'Test',
      } as ProjectCreate;

      await expect(service.createProject(invalidProject)).rejects.toThrow();
    });

    it('should throw ValidationError for missing required fields', async () => {
      const invalidProject = {
        name: 'Test',
        // missing 'key' field
      } as ProjectCreate;

      await expect(service.createProject(invalidProject)).rejects.toThrow();
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      const update = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, name: 'Updated Name' };

      mockClient.put.mockResolvedValue(updatedProject);

      const result = await service.updateProject('TEST-001', update);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/api/v1/projects/TEST-001',
        update,
      );
      expect(result).toEqual(updatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.deleteProject('TEST-001');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/api/v1/projects/TEST-001',
      );
    });
  });

  describe('getProjectState', () => {
    it('should fetch and validate project state', async () => {
      const mockState = {
        project_key: 'TEST-001',
        current_state: 'active',
        history: [
          {
            state: 'active',
            timestamp: '2024-01-01T00:00:00Z',
            note: 'Initial state',
          },
        ],
      };

      mockClient.getValidated.mockResolvedValue(mockState);

      const result = await service.getProjectState('TEST-001');

      expect(mockClient.getValidated).toHaveBeenCalledWith(
        '/api/v1/projects/TEST-001/state',
        expect.any(Object),
      );
      expect(result).toEqual(mockState);
    });
  });
});
