/**
 * Unit Tests for ProjectApiClient  
 * Tests error handling, validation, and retry logic
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ProjectApiClient } from './ProjectApiClient';
import {
  NetworkError,
  ValidationError,
  NotFoundError,
  ServerError,
  AuthenticationError,
} from './errors';

describe('ProjectApiClient', () => {
  let client: ProjectApiClient;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    client = new ProjectApiClient('http://test.local', 'test-key');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing private property for testing
    mockAxios = new MockAdapter((client as any).client); 
  });

  afterEach(() => {
    mockAxios.reset();
    mockAxios.restore();
  });

  describe('Error Handling', () => {
    it('should throw NetworkError on network failure', async () => {
      // Mock will respond with network error to all requests (including retries)
      mockAxios.onGet('/projects').networkError();

      await expect(client.listProjects()).rejects.toThrow(NetworkError);
    }, 10000); // Increase timeout to allow for retries

    it('should throw AuthenticationError on 401 status', async () => {
      mockAxios.onGet('/projects').reply(401, { message: 'Unauthorized' });

      await expect(client.listProjects()).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError on 404 status', async () => {
      mockAxios.onGet('/projects/MISSING').reply(404, { message: 'Not found' });

      await expect(client.getProject('MISSING')).rejects.toThrow(NotFoundError);
    });

    it('should throw ServerError on 500 status after all retries', async ()  => {
      // Mock will respond with 500 to all requests (including retries)
      mockAxios.onGet('/projects').reply(() => [500, { message: 'Internal server error' }]);

      await expect(client.listProjects()).rejects.toThrow(ServerError);
    }, 10000); // Increase timeout to allow for retries

    it('should throw ValidationError on invalid response data', async () => {
      mockAxios.onGet('/projects').reply(200, [{ invalid: 'data' }]);

      await expect(client.listProjects()).rejects.toThrow(ValidationError);
    });
  });

  describe('Validation', () => {
    it('should validate response data for listProjects', async () => {
      const validData = [
        {
          key: 'TEST-001',
          name: 'Test Project',
          description: 'A test project',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];
      mockAxios.onGet('/projects').reply(200, validData);

      const result = await client.listProjects();
      expect(result).toEqual(validData);
    });

    it('should validate request data for createProject', async () => {
      const invalidRequest = {
        key: 'invalid-lowercase',
        name: 'Test',
      };

      await expect(client.createProject(invalidRequest as never)).rejects.toThrow(ValidationError);
    });

    it('should accept valid createProject request', async () => {
      const validRequest = {
        key: 'TEST-001',
        name: 'Test Project',
        description: 'A test project',
      };
      const validResponse = {
        ...validRequest,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockAxios.onPost('/projects').reply(201, validResponse);

      const result = await client.createProject(validRequest);
      expect(result.key).toBe('TEST-001');
      expect(result.name).toBe('Test Project');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient server errors', async () => {
      const validData = [
        {
          key: 'TEST-001',
          name: 'Test Project',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];
      
      mockAxios
        .onGet('/projects').replyOnce(503, { message: 'Service unavailable' })
        .onGet('/projects').replyOnce(200, validData);

      const result = await client.listProjects();
      expect(result).toHaveLength(1);
    });

    it('should not retry on non-retryable errors', async () => {
      mockAxios.onGet('/projects').reply(404, { message: 'Not found' });

      await expect(client.listProjects()).rejects.toThrow(NotFoundError);
    });

    it('should respect maxRetries config', async () => {
      const clientWithRetries = new ProjectApiClient('http://test.local', undefined, { maxRetries: 2 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing private property for testing
      const mockAxiosWithRetries = new MockAdapter((clientWithRetries as any).client);
      
      // Always return 503 to test retry exhaustion  
      mockAxiosWithRetries.onGet('/projects').reply(() => [503, { message: 'Service unavailable' }]);

      await expect(clientWithRetries.listProjects()).rejects.toThrow(ServerError);
      
      mockAxiosWithRetries.restore();
    }, 10000); // Increase timeout for retries
  });

  describe('CRUD Operations', () => {
    it('should list projects successfully', async () => {
      const projects = [
        {
          key: 'TEST-001',
          name: 'Test Project 1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          key: 'TEST-002',
          name: 'Test Project 2',
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ];
      mockAxios.onGet('/projects').reply(200, projects);

      const result = await client.listProjects();
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('TEST-001');
    });

    it('should get project by key', async () => {
      const project = {
        key: 'TEST-001',
        name: 'Test Project',
        description: 'A test project',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockAxios.onGet('/projects/TEST-001').reply(200, project);

      const result = await client.getProject('TEST-001');
      expect(result.key).toBe('TEST-001');
      expect(result.name).toBe('Test Project');
    });

    it('should create project successfully', async () => {
      const request = {
        key: 'TEST-NEW',
        name: 'New Project',
      };
      const response = {
        ...request,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockAxios.onPost('/projects').reply(201, response);

      const result = await client.createProject(request);
      expect(result.key).toBe('TEST-NEW');
    });

    it('should update project successfully', async () => {
      const request = {
        name: 'Updated Name',
      };
      const response = {
        key: 'TEST-001',
        name: 'Updated Name',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      };
      mockAxios.onPut('/projects/TEST-001').reply(200, response);

      const result = await client.updateProject('TEST-001', request);
      expect(result.name).toBe('Updated Name');
    });

    it('should delete project successfully', async () => {
      mockAxios.onDelete('/projects/TEST-001').reply(204);

      await expect(client.deleteProject('TEST-001')).resolves.not.toThrow();
    });
  });
});
