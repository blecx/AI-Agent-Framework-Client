/**
 * Unit tests for TemplateApiClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { TemplateApiClient } from '../../../services/TemplateApiClient';
import type { Template, TemplateCreate, TemplateUpdate } from '../../../types/template';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

type MockAxiosInstance = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('TemplateApiClient', () => {
  let client: TemplateApiClient;
  let mockAxiosInstance: MockAxiosInstance;

  const mockTemplate: Template = {
    id: 'tpl-001',
    name: 'Project Management Plan',
    description: 'Standard PMP template',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        scope: { type: 'string' },
      },
      required: ['title'],
    },
    markdown_template: '# {{title}}\n\n## Scope\n{{scope}}',
    artifact_type: 'pmp',
    version: '1.0.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);
    client = new TemplateApiClient('http://localhost:8000');
  });

  // =========================================================================
  // listTemplates Tests
  // =========================================================================

  describe('listTemplates', () => {
    it('should list all templates successfully', async () => {
      const templates = [
        mockTemplate,
        { ...mockTemplate, id: 'tpl-002', name: 'RAID Register' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: templates });

      const result = await client.listTemplates();

      expect(result).toEqual(templates);
      expect(result).toHaveLength(2);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/templates');
    });

    it('should return empty array when no templates exist', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await client.listTemplates();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle 500 server error', async () => {
      const error = new Error('Internal server error');
      (error as unknown as { response: { status: number } }).response = { status: 500 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listTemplates()).rejects.toThrow();
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      (error as unknown as { code: string }).code = 'ECONNREFUSED';
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listTemplates()).rejects.toThrow('Network Error');
    });
  });

  // =========================================================================
  // getTemplate Tests
  // =========================================================================

  describe('getTemplate', () => {
    it('should get template by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockTemplate });

      const result = await client.getTemplate('tpl-001');

      expect(result).toEqual(mockTemplate);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/templates/tpl-001');
    });

    it('should handle 404 template not found', async () => {
      const error = new Error('Template not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getTemplate('invalid-id')).rejects.toThrow();
    });

    it('should get template with complex schema', async () => {
      const complexTemplate: Template = {
        ...mockTemplate,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 5 },
            sections: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: complexTemplate });

      const result = await client.getTemplate('tpl-complex');

      expect(result.schema.properties.sections).toBeDefined();
    });
  });

  // =========================================================================
  // createTemplate Tests
  // =========================================================================

  describe('createTemplate', () => {
    it('should create template successfully', async () => {
      const templateCreate: TemplateCreate = {
        name: 'New Template',
        description: 'Test template',
        schema: { type: 'object', properties: {} },
        markdown_template: '# {{title}}',
        artifact_type: 'report' as const,
        version: '1.0.0',
      };

      const createdTemplate: Template = {
        id: 'tpl-new',
        name: templateCreate.name,
        description: templateCreate.description,
        schema: templateCreate.schema,
        markdown_template: templateCreate.markdown_template,
        artifact_type: 'report',
        version: '1.0.0',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: createdTemplate });

      const result = await client.createTemplate(templateCreate);

      expect(result).toEqual(createdTemplate);
      expect(result.id).toBe('tpl-new');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/templates',
        templateCreate
      );
    });

    it('should handle 400 validation error', async () => {
      const error = new Error('Invalid template data');
      (error as unknown as { response: { status: number; data: { detail: string } } }).response = {
        status: 400,
        data: { detail: 'Schema validation failed' },
      };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.createTemplate({} as TemplateCreate)).rejects.toThrow();
    });

    it('should handle duplicate template ID error', async () => {
      const error = new Error('Template already exists');
      (error as unknown as { response: { status: number } }).response = { status: 409 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        client.createTemplate({
          name: 'Duplicate',
          description: 'Test',
          schema: {},
          markdown_template: '',
          artifact_type: 'pmp',
          version: '1.0.0',
        } as TemplateCreate)
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // updateTemplate Tests
  // =========================================================================

  describe('updateTemplate', () => {
    it('should update template successfully', async () => {
      const templateUpdate: TemplateUpdate = {
        description: 'Updated description',
        version: '1.1.0',
      };

      const updatedTemplate: Template = {
        ...mockTemplate,
        description: 'Updated description',
        version: '1.1.0',
      };

      mockAxiosInstance.put.mockResolvedValue({ data: updatedTemplate });

      const result = await client.updateTemplate('tpl-001', templateUpdate);

      expect(result).toEqual(updatedTemplate);
      expect(result.description).toBe('Updated description');
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/api/v1/templates/tpl-001',
        templateUpdate
      );
    });

    it('should update template schema', async () => {
      const templateUpdate: TemplateUpdate = {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            newField: { type: 'number' },
          },
        },
      };

      const updatedTemplate: Template = {
        ...mockTemplate,
        schema: templateUpdate.schema!,
      };

      mockAxiosInstance.put.mockResolvedValue({ data: updatedTemplate });

      const result = await client.updateTemplate('tpl-001', templateUpdate);

      expect(result.schema.properties.newField).toBeDefined();
    });

    it('should handle 404 template not found', async () => {
      const error = new Error('Template not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(
        client.updateTemplate('invalid-id', { description: 'test' })
      ).rejects.toThrow();
    });

    it('should handle 400 validation error on update', async () => {
      const error = new Error('Invalid update data');
      (error as unknown as { response: { status: number } }).response = { status: 400 };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(
        client.updateTemplate('tpl-001', { version: 'invalid-version' })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // deleteTemplate Tests
  // =========================================================================

  describe('deleteTemplate', () => {
    it('should delete template successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await client.deleteTemplate('tpl-001');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/templates/tpl-001');
    });

    it('should handle 404 template not found on delete', async () => {
      const error = new Error('Template not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(client.deleteTemplate('invalid-id')).rejects.toThrow();
    });

    it('should handle 409 template in use error', async () => {
      const error = new Error('Template is in use by active projects');
      (error as unknown as { response: { status: number } }).response = { status: 409 };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(client.deleteTemplate('tpl-001')).rejects.toThrow();
    });
  });

  // =========================================================================
  // Constructor Tests
  // =========================================================================

  describe('constructor', () => {
    it('should create client with default base URL', () => {
      void new TemplateApiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );
    });

    it('should create client with custom base URL', () => {
      void new TemplateApiClient('https://api.example.com');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
        })
      );
    });
  });

  // =========================================================================
  // Template Type Tests
  // =========================================================================

  describe('template artifact types', () => {
    it('should handle pmp artifact type', async () => {
      const pmpTemplate = { ...mockTemplate, artifact_type: 'pmp' };
      mockAxiosInstance.get.mockResolvedValue({ data: pmpTemplate });

      const result = await client.getTemplate('tpl-pmp');

      expect(result.artifact_type).toBe('pmp');
    });

    it('should handle raid artifact type', async () => {
      const raidTemplate = { ...mockTemplate, artifact_type: 'raid' };
      mockAxiosInstance.get.mockResolvedValue({ data: raidTemplate });

      const result = await client.getTemplate('tpl-raid');

      expect(result.artifact_type).toBe('raid');
    });

    it('should handle blueprint artifact type', async () => {
      const blueprintTemplate = { ...mockTemplate, artifact_type: 'blueprint' };
      mockAxiosInstance.get.mockResolvedValue({ data: blueprintTemplate });

      const result = await client.getTemplate('tpl-blueprint');

      expect(result.artifact_type).toBe('blueprint');
    });
  });

  // =========================================================================
  // Singleton Instance Tests
  // =========================================================================

  describe('singleton instance', () => {
    it('should export singleton templateApiClient', async () => {
      const { templateApiClient } = await import(
        '../../../services/TemplateApiClient'
      );

      expect(templateApiClient).toBeDefined();
      expect(templateApiClient).toBeInstanceOf(TemplateApiClient);
    });
  });
});
