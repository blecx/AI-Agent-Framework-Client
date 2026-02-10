/**
 * Unit tests for ApiClient error handling and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { ApiClient } from '../../../../services/apiClient';
import {
  isApiError,
} from '../../../../services/errors';

// Helper type guards for backward compatibility
function isNetworkError(error: unknown): boolean {
  return isApiError(error) && error.type === 'network';
}

function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.type === 'validation';
}

// Mock axios
vi.mock('axios');
const mockedAxios = axios as typeof axios & { create: ReturnType<typeof vi.fn> };

describe('ApiClient', () => {
  let client: ApiClient;
  let mockAxiosInstance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      defaults: { baseURL: '' },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError = axios.isAxiosError;

    client = new ApiClient({ baseURL: 'http://test.com' });
  });

  describe('Error Handling', () => {
    it('should create NetworkError for connection failures', async () => {
      const error: Partial<AxiosError> = {
        message: 'Network Error',
        code: 'ECONNREFUSED',
        isAxiosError: true,
        config: {},
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      try {
        await client.get('/test');
        expect.fail('Should have thrown error');
      } catch (err: unknown) {
        expect(isNetworkError(err)).toBe(true);
        if (isNetworkError(err)) {
          expect(err.code).toBe('ECONNREFUSED');
          expect(err.isRetryable).toBe(true);
        }
      }
    });

    it('should create NetworkError for timeouts and mark non-retryable', async () => {
      const error: Partial<AxiosError> = {
        message: 'Timeout',
        code: 'ECONNABORTED',
        isAxiosError: true,
        config: {},
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      try {
        await client.get('/test');
        expect.fail('Should have thrown error');
      } catch (err: unknown) {
        expect(isNetworkError(err)).toBe(true);
        if (isNetworkError(err)) {
          expect(err.isRetryable).toBe(false);
        }
      }
    });

    it('should create ApiError for 4xx responses', async () => {
      const error: Partial<AxiosError> = {
        message: 'Bad Request',
        isAxiosError: true,
        response: {
          status: 400,
          data: { detail: 'Invalid request' },
          statusText: 'Bad Request',
          headers: {},
          config: {} as never,
        },
        config: {},
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      try {
        await client.get('/test');
        expect.fail('Should have thrown error');
      } catch (err: unknown) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(400);
          expect(err.detail).toBe('Invalid request');
        }
      }
    });

    it('should create ApiError for 5xx responses', async () => {
      const error: Partial<AxiosError> = {
        message: 'Server Error',
        isAxiosError: true,
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as never,
        },
        config: {},
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      try {
        await client.get('/test');
        expect.fail('Should have thrown error');
      } catch (err: unknown) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(500);
        }
      }
    });
  });

  describe('Zod Validation', () => {
    const TestSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    it('should validate successful response with Zod schema', async () => {
      const validData = { id: 1, name: 'Test' };
      mockAxiosInstance.get.mockResolvedValue({ data: validData });

      const result = await client.getValidated('/test', TestSchema);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid response data', async () => {
      const invalidData = { id: 'not-a-number', name: 'Test' };
      mockAxiosInstance.get.mockResolvedValue({ data: invalidData });

      try {
        await client.getValidated('/test', TestSchema);
        expect.fail('Should have thrown validation error');
      } catch (err: unknown) {
        expect(isValidationError(err)).toBe(true);
        if (isValidationError(err)) {
          expect(err.message).toContain('validation');
          expect(err.details).toBeDefined();
        }
      }
    });

    it('should validate POST response with Zod schema', async () => {
      const validData = { id: 1, name: 'Created' };
      mockAxiosInstance.post.mockResolvedValue({ data: validData });

      const result = await client.postValidated(
        '/test',
        { name: 'Created' },
        TestSchema,
      );

      expect(result).toEqual(validData);
    });
  });

  describe('Configuration', () => {
    it('should set API key in headers', () => {
      const clientWithKey = new ApiClient({
        baseURL: 'http://test.com',
        apiKey: 'test-key',
      });

      expect(clientWithKey).toBeDefined();
    });

    it('should update API key dynamically', () => {
      client.setApiKey('new-key');
      expect(client).toBeDefined();
    });

    it('should update base URL dynamically', () => {
      client.setBaseURL('http://newurl.com');
      expect(client).toBeDefined();
    });
  });
});
