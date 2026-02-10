/**
 * Unit tests for AuditApiClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  AuditApiClient,
  type AuditResult,
  type AuditIssue,
} from '../../../services/AuditApiClient';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('AuditApiClient', () => {
  let client: AuditApiClient;
  let mockAxiosInstance: any;

  const mockAuditResult: AuditResult = {
    projectKey: 'PROJ-001',
    timestamp: '2026-02-10T10:00:00Z',
    issues: [
      {
        id: 'audit-001',
        severity: 'error',
        artifact: 'artifacts/pmp.md',
        field: 'scope',
        message: 'Scope section is empty',
        rule: 'required-field',
      },
      {
        id: 'audit-002',
        severity: 'warning',
        artifact: 'artifacts/raid.md',
        field: 'mitigation_plan',
        message: 'Risk mitigation plan missing',
        rule: 'raid-completeness',
      },
    ],
    summary: {
      errors: 1,
      warnings: 1,
      info: 0,
    },
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

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new AuditApiClient('http://localhost:8000');
  });

  // =========================================================================
  // getAuditResults Tests
  // =========================================================================

  describe('getAuditResults', () => {
    it('should get audit results successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockAuditResult });

      const result = await client.getAuditResults('PROJ-001');

      expect(result).toEqual(mockAuditResult);
      expect(result.issues).toHaveLength(2);
      expect(result.summary.errors).toBe(1);
      expect(result.summary.warnings).toBe(1);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/audit/results'
      );
    });

    it('should return audit results with no issues', async () => {
      const cleanAudit: AuditResult = {
        projectKey: 'PROJ-002',
        timestamp: '2026-02-10T10:00:00Z',
        issues: [],
        summary: {
          errors: 0,
          warnings: 0,
          info: 0,
        },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: cleanAudit });

      const result = await client.getAuditResults('PROJ-002');

      expect(result.issues).toHaveLength(0);
      expect(result.summary.errors).toBe(0);
    });

    it('should handle 404 project not found', async () => {
      const error = new Error('Project not found');
      (error as any).response = { status: 404 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getAuditResults('INVALID')).rejects.toThrow(
        'Project not found'
      );
    });

    it('should handle 500 server error', async () => {
      const error = new Error('Internal server error');
      (error as any).response = { status: 500 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getAuditResults('PROJ-001')).rejects.toThrow();
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      (error as any).code = 'ECONNREFUSED';
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getAuditResults('PROJ-001')).rejects.toThrow(
        'Network Error'
      );
    });
  });

  // =========================================================================
  // runAudit Tests
  // =========================================================================

  describe('runAudit', () => {
    it('should trigger audit run successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuditResult });

      const result = await client.runAudit('PROJ-001');

      expect(result).toEqual(mockAuditResult);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/audit/run'
      );
    });

    it('should run audit and return issues', async () => {
      const auditWithIssues: AuditResult = {
        projectKey: 'PROJ-003',
        timestamp: '2026-02-10T11:00:00Z',
        issues: [
          {
            id: 'audit-003',
            severity: 'info',
            artifact: 'artifacts/blueprint.json',
            field: 'description',
            message: 'Consider adding more detail',
            rule: 'completeness-check',
          },
        ],
        summary: {
          errors: 0,
          warnings: 0,
          info: 1,
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: auditWithIssues });

      const result = await client.runAudit('PROJ-003');

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('info');
      expect(result.summary.info).toBe(1);
    });

    it('should handle 404 project not found when running audit', async () => {
      const error = new Error('Project not found');
      (error as any).response = { status: 404 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.runAudit('INVALID')).rejects.toThrow('Project not found');
    });

    it('should handle audit execution timeout', async () => {
      const error = new Error('Audit execution timed out');
      (error as any).code = 'ECONNABORTED';
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.runAudit('PROJ-001')).rejects.toThrow('timed out');
    });

    it('should handle concurrent audit runs', async () => {
      const error = new Error('Audit already running');
      (error as any).response = { status: 409 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.runAudit('PROJ-001')).rejects.toThrow(
        'Audit already running'
      );
    });
  });

  // =========================================================================
  // Constructor Tests
  // =========================================================================

  describe('constructor', () => {
    it('should create client with default base URL', () => {
      const defaultClient = new AuditApiClient();

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
      const customClient = new AuditApiClient('https://api.example.com');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
        })
      );
    });
  });

  // =========================================================================
  // Audit Issue Types Tests
  // =========================================================================

  describe('audit issue severity handling', () => {
    it('should handle error severity issues', async () => {
      const errorAudit: AuditResult = {
        projectKey: 'PROJ-001',
        timestamp: '2026-02-10T10:00:00Z',
        issues: [
          {
            id: 'err-001',
            severity: 'error',
            artifact: 'test.md',
            field: 'field',
            message: 'Critical issue',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0 },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: errorAudit });
      const result = await client.getAuditResults('PROJ-001');

      expect(result.issues[0].severity).toBe('error');
    });

    it('should handle warning severity issues', async () => {
      const warningAudit: AuditResult = {
        projectKey: 'PROJ-001',
        timestamp: '2026-02-10T10:00:00Z',
        issues: [
          {
            id: 'warn-001',
            severity: 'warning',
            artifact: 'test.md',
            field: 'field',
            message: 'Warning issue',
          },
        ],
        summary: { errors: 0, warnings: 1, info: 0 },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: warningAudit });
      const result = await client.getAuditResults('PROJ-001');

      expect(result.issues[0].severity).toBe('warning');
    });

    it('should handle info severity issues', async () => {
      const infoAudit: AuditResult = {
        projectKey: 'PROJ-001',
        timestamp: '2026-02-10T10:00:00Z',
        issues: [
          {
            id: 'info-001',
            severity: 'info',
            artifact: 'test.md',
            field: 'field',
            message: 'Info issue',
          },
        ],
        summary: { errors: 0, warnings: 0, info: 1 },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: infoAudit });
      const result = await client.getAuditResults('PROJ-001');

      expect(result.issues[0].severity).toBe('info');
    });
  });
});
