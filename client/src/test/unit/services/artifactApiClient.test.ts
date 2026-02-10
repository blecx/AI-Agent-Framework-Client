/**
 * Unit tests for ArtifactApiClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { ArtifactApiClient, type Artifact } from '../../../services/ArtifactApiClient';

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

describe('ArtifactApiClient', () => {
  let client: ArtifactApiClient;
  let mockAxiosInstance: MockAxiosInstance;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    // Create client instance
    client = new ArtifactApiClient('http://localhost:8000');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // listArtifacts Tests
  // =========================================================================

  describe('listArtifacts', () => {
    it('should list artifacts successfully', async () => {
      const mockArtifacts: Artifact[] = [
        {
          path: 'artifacts/pmp.md',
          name: 'Project Management Plan',
          type: 'pmp',
          versions: [{ version: '1.0.0', date: '2026-01-01T00:00:00Z' }],
        },
        {
          path: 'artifacts/raid.md',
          name: 'RAID Register',
          type: 'raid',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockArtifacts });

      const result = await client.listArtifacts('PROJ-001');

      expect(result).toEqual(mockArtifacts);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/artifacts'
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty artifact list', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await client.listArtifacts('PROJ-002');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle 404 project not found error', async () => {
      const error = new Error('Project not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listArtifacts('INVALID')).rejects.toThrow(
        'Project not found'
      );
    });

    it('should handle 500 server error', async () => {
      const error = new Error('Internal server error');
      (error as unknown as { response: { status: number } }).response = { status: 500 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listArtifacts('PROJ-001')).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      (error as unknown as { code: string }).code = 'ECONNREFUSED';
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listArtifacts('PROJ-001')).rejects.toThrow(
        'Network Error'
      );
    });

    it('should handle timeout error', async () => {
      const error = new Error('Timeout');
      (error as unknown as { code: string }).code = 'ECONNABORTED';
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.listArtifacts('PROJ-001')).rejects.toThrow('Timeout');
    });
  });

  // =========================================================================
  // getArtifact Tests
  // =========================================================================

  describe('getArtifact', () => {
    it('should get artifact content successfully', async () => {
      const mockContent = '# Project Management Plan\n\n## Overview\nThis is a test.';

      mockAxiosInstance.get.mockResolvedValue({ data: mockContent });

      const result = await client.getArtifact('PROJ-001', 'artifacts/pmp.md');

      expect(result).toBe(mockContent);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/artifacts/artifacts/pmp.md',
        { responseType: 'text' }
      );
    });

    it('should get empty artifact content', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: '' });

      const result = await client.getArtifact('PROJ-001', 'artifacts/empty.md');

      expect(result).toBe('');
    });

    it('should handle 404 artifact not found', async () => {
      const error = new Error('Artifact not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(
        client.getArtifact('PROJ-001', 'artifacts/missing.md')
      ).rejects.toThrow('Artifact not found');
    });

    it('should handle special characters in artifact path', async () => {
      const mockContent = '# Test';
      mockAxiosInstance.get.mockResolvedValue({ data: mockContent });

      await client.getArtifact('PROJ-001', 'artifacts/file with spaces.md');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/artifacts/artifacts/file with spaces.md',
        { responseType: 'text' }
      );
    });

    it('should handle binary artifact content', async () => {
      const mockBinaryContent = Buffer.from('PNG binary data');
      mockAxiosInstance.get.mockResolvedValue({ data: mockBinaryContent });

      const result = await client.getArtifact('PROJ-001', 'artifacts/diagram.png');

      expect(result).toEqual(mockBinaryContent);
    });
  });

  // =========================================================================
  // Constructor Tests
  // =========================================================================

  describe('constructor', () => {
    it('should create client with default base URL', () => {
      void new ArtifactApiClient();

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
      void new ArtifactApiClient('https://api.example.com');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
        })
      );
    });

    it('should set correct timeout', () => {
      new ArtifactApiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });
  });

  // =========================================================================
  // Singleton Instance Tests
  // =========================================================================

  describe('singleton instance', () => {
    it('should export singleton artifactApiClient', async () => {
      // Import the singleton
      const { artifactApiClient } = await import(
        '../../../services/ArtifactApiClient'
      );

      expect(artifactApiClient).toBeDefined();
      expect(artifactApiClient).toBeInstanceOf(ArtifactApiClient);
    });
  });
});
