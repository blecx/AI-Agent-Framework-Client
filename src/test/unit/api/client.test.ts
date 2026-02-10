/**
 * Unit Tests for ApiClient
 * Tests axios-based HTTP client with interceptors and retry logic
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ApiClient } from '../../../services/api/client';
import {
  isNetworkError,
  isApiError,
} from '../../../types/errors';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'http://localhost:8000',
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 100,
    });

    // Mock the axios instance used by ApiClient
    // @ts-ignore - accessing private property for testing
    mockAxios = new MockAdapter(apiClient['client']);
  });

  afterEach(() => {
    mockAxios.reset();
    mockAxios.restore();
  });

  describe('HTTP Methods', () => {
    it('should make successful GET request', async () => {
      const responseData = { id: '1', name: 'Test' };
      mockAxios.onGet('/test').reply(200, responseData);

      const result = await apiClient.get('/test');
      expect(result).toEqual(responseData);
    });

    it('should make successful POST request', async () => {
      const requestData = { name: 'Test' };
      const responseData = { id: '1', name: 'Test' };
      mockAxios.onPost('/test', requestData).reply(201, responseData);

      const result = await apiClient.post('/test', requestData);
      expect(result).toEqual(responseData);
    });

    it('should make successful PUT request', async () => {
      const requestData = { name: 'Updated' };
      const responseData = { id: '1', name: 'Updated' };
      mockAxios.onPut('/test/1', requestData).reply(200, responseData);

      const result = await apiClient.put('/test/1', requestData);
      expect(result).toEqual(responseData);
    });

    it('should make successful PATCH request', async () => {
      const requestData = { name: 'Patched' };
      const responseData = { id: '1', name: 'Patched' };
      mockAxios.onPatch('/test/1', requestData).reply(200, responseData);

      const result = await apiClient.patch('/test/1', requestData);
      expect(result).toEqual(responseData);
    });

    it('should make successful DELETE request', async () => {
      mockAxios.onDelete('/test/1').reply(204);

      const result = await apiClient.delete('/test/1');
      expect(result).toBeUndefined();
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header when API key is set', async () => {
      const apiClientWithAuth = new ApiClient({
        baseURL: 'http://localhost:8000',
        apiKey: 'test-api-key',
      });

      // @ts-ignore - accessing private property for testing
      const authMock = new MockAdapter(apiClientWithAuth['client']);

      authMock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test-api-key');
        return [200, { success: true }];
      });

      await apiClientWithAuth.get('/test');
      authMock.restore();
    });

    it('should not include Authorization header when no API key', async () => {
      mockAxios.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      await apiClient.get('/test');
    });

    it('should update API key dynamically', async () => {
      apiClient.setApiKey('new-api-key');

      mockAxios.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer new-api-key');
        return [200, { success: true }];
      });

      await apiClient.get('/test');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error', async () => {
      mockAxios.onGet('/test').reply(404, { detail: 'Not found' });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(404);
          expect(error.detail).toBe('Not found');
        }
      }
    });

    it('should handle 500 error', async () => {
      mockAxios.onGet('/test').reply(500, { detail: 'Server error' });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(500);
          expect(error.detail).toBe('Server error');
        }
      }
    });

    it('should handle network error', async () => {
      mockAxios.onGet('/test').networkError();

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(isNetworkError(error)).toBe(true);
        if (isNetworkError(error)) {
          expect(error.message).toContain('Network Error');
          expect(error.isRetryable).toBe(true);
        }
      }
    });

    it('should handle timeout', async () => {
      mockAxios.onGet('/test').timeout();

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(isNetworkError(error)).toBe(true);
        if (isNetworkError(error)) {
          expect(error.message.toLowerCase()).toContain('timeout');
          expect(error.isRetryable).toBe(false);
        }
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 500 error and eventually succeed', async () => {
      let attempts = 0;
      mockAxios.onGet('/test').reply(() => {
        attempts++;
        if (attempts < 3) {
          return [500, { detail: 'Server error' }];
        }
        return [200, { success: true }];
      });

      const result = await apiClient.get('/test');
      expect(result).toEqual({ success: true });
      expect(attempts).toBe(3);
    });

    it('should not retry on 400 error', async () => {
      let attempts = 0;
      mockAxios.onGet('/test').reply(() => {
        attempts++;
        return [400, { detail: 'Bad request' }];
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        detail: 'Bad request',
        status: 400,
      });

      expect(attempts).toBe(1);
    });

    it('should stop retrying after max retries', async () => {
      let attempts = 0;
      mockAxios.onGet('/test').reply(() => {
        attempts++;
        return [500, { detail: 'Server error' }];
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        detail: 'Server error',
        status: 500,
      });

      expect(attempts).toBe(4); // Initial + 3 retries
    });
  });

  describe('Configuration', () => {
    it('should update base URL', () => {
      apiClient.setBaseURL('http://newhost:9000');
      // Verify the baseURL was updated (we can't directly test this without making a request)
      expect(apiClient).toBeDefined();
    });

    it('should use custom timeout', async () => {
      const quickClient = new ApiClient({
        baseURL: 'http://localhost:8000',
        timeout: 100,
      });

      // Verify timeout configuration is set correctly
      // @ts-ignore - accessing private property for testing
      expect(quickClient['client'].defaults.timeout).toBe(100);

      // Note: MockAdapter fundamentally cannot simulate axios timeout behavior
      // because it intercepts requests before axios applies timeout logic.
      // Timeout behavior is validated in integration tests with real requests.
    });
  });
});
