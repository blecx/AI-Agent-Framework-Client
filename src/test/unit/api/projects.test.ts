/**
 * Unit Tests for ProjectsService
 * Tests project-related API calls
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ApiClient } from '../../../services/api/client';
import { ProjectsService } from '../../../services/api/projects';
import { ProjectInfo, ProjectCreate } from '../../../types/api';

describe('ProjectsService', () => {
  let apiClient: ApiClient;
  let projectsService: ProjectsService;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'http://localhost:8000',
    });
    projectsService = new ProjectsService(apiClient);
    // @ts-ignore - accessing private property for testing
    mockAxios = new MockAdapter(apiClient['client']);
  });

  afterEach(() => {
    mockAxios.reset();
    mockAxios.restore();
  });

  describe('listProjects', () => {
    it('should list all projects', async () => {
      const projects: ProjectInfo[] = [
        {
          key: 'PROJ1',
          name: 'Project 1',
          created_at: '2026-01-18T00:00:00Z',
          updated_at: '2026-01-18T00:00:00Z',
        },
      ];

      mockAxios.onGet('/api/v1/projects').reply(200, projects);

      const result = await projectsService.listProjects();
      expect(result).toEqual(projects);
    });
  });

  describe('getProject', () => {
    it('should get project by key', async () => {
      const project: ProjectInfo = {
        key: 'PROJ1',
        name: 'Project 1',
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T00:00:00Z',
      };

      mockAxios.onGet('/api/v1/projects/PROJ1').reply(200, project);

      const result = await projectsService.getProject('PROJ1');
      expect(result).toEqual(project);
    });
  });

  describe('createProject', () => {
    it('should create new project', async () => {
      const createData: ProjectCreate = {
        key: 'PROJ1',
        name: 'Project 1',
        description: 'Test project',
      };

      const createdProject: ProjectInfo = {
        ...createData,
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T00:00:00Z',
      };

      mockAxios
        .onPost('/api/v1/projects', createData)
        .reply(201, createdProject);

      const result = await projectsService.createProject(createData);
      expect(result).toEqual(createdProject);
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      const updateData = { name: 'Updated Project' };
      const updatedProject: ProjectInfo = {
        key: 'PROJ1',
        name: 'Updated Project',
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T01:00:00Z',
      };

      mockAxios
        .onPut('/api/v1/projects/PROJ1', updateData)
        .reply(200, updatedProject);

      const result = await projectsService.updateProject('PROJ1', updateData);
      expect(result).toEqual(updatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete project', async () => {
      mockAxios.onDelete('/api/v1/projects/PROJ1').reply(204);

      await expect(
        projectsService.deleteProject('PROJ1'),
      ).resolves.toBeUndefined();
    });
  });
});
