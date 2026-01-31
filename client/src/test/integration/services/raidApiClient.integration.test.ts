/**
 * Integration tests for RAID API Client
 * Tests the full request/response cycle with mocked HTTP server
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiClient } from '../../../services/apiClient';
import type {
  RAIDItem,
  RAIDItemCreate,
  RAIDItemUpdate,
  RAIDItemList,
} from '../../../types';

const API_BASE_URL = 'http://localhost:8000';
const TEST_PROJECT_KEY = 'TEST_PROJ';

// Mock data
const mockRAIDItem: RAIDItem = {
  id: 'raid-001',
  type: 'risk',
  title: 'Integration Test Risk',
  description: 'Risk identified during integration testing',
  status: 'open',
  owner: 'integration-tester',
  priority: 'high',
  impact: 'high',
  likelihood: 'likely',
  mitigation_plan: 'Implement additional safeguards',
  next_actions: ['Review safety protocols', 'Update documentation'],
  linked_decisions: [],
  linked_change_requests: [],
  created_at: '2026-01-31T10:00:00Z',
  updated_at: '2026-01-31T10:00:00Z',
  created_by: 'integration-tester',
  updated_by: 'integration-tester',
  target_resolution_date: '2026-02-28',
};

// Setup MSW server
const server = setupServer();

beforeAll(() => {
  // Use 'warn' instead of 'error' to allow axios interceptors to work
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  apiClient.setBaseUrl(API_BASE_URL);
});

describe('RAID API Client Integration Tests', () => {
  describe('listRAIDItems', () => {
    it('should successfully fetch RAID items list', async () => {
      const mockResponse: RAIDItemList = {
        items: [mockRAIDItem],
        total: 1,
        filtered_by: null,
      };

      server.use(
        http.get(`${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`, () => {
          return HttpResponse.json(mockResponse, { status: 200 });
        }),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.items[0].title).toBe('Integration Test Risk');
    });

    it('should handle 404 error when project not found', async () => {
      server.use(
        http.get(`${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`, () => {
          return HttpResponse.json(
            { detail: 'Project not found' },
            { status: 404 },
          );
        }),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });

    it('should handle 500 server error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`, () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 },
          );
        }),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });

    it('should apply filters correctly', async () => {
      const mockFilteredResponse: RAIDItemList = {
        items: [mockRAIDItem],
        total: 1,
        filtered_by: {
          type: 'risk',
          status: 'open',
          priority: 'high',
        },
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('type')).toBe('risk');
            expect(url.searchParams.get('status')).toBe('open');
            expect(url.searchParams.get('priority')).toBe('high');

            return HttpResponse.json(mockFilteredResponse, { status: 200 });
          },
        ),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY, {
        type: 'risk',
        status: 'open',
        priority: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data?.filtered_by).toEqual({
        type: 'risk',
        status: 'open',
        priority: 'high',
      });
    });

    it.skip('should handle network timeout', async () => {
      // Skipped: This test takes 30+ seconds which is too long for CI
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 35000)); // Exceed 30s timeout
            return HttpResponse.json({}, { status: 200 });
          },
        ),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timeout|timed out/i);
    });
  });

  describe('getRAIDItem', () => {
    it('should successfully fetch a single RAID item', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/${mockRAIDItem.id}`,
          () => {
            return HttpResponse.json(mockRAIDItem, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getRAIDItem(
        TEST_PROJECT_KEY,
        mockRAIDItem.id,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRAIDItem);
      expect(result.data?.id).toBe('raid-001');
    });

    it('should handle 404 when RAID item not found', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/nonexistent`,
          () => {
            return HttpResponse.json(
              { detail: 'RAID item not found' },
              { status: 404 },
            );
          },
        ),
      );

      const result = await apiClient.getRAIDItem(
        TEST_PROJECT_KEY,
        'nonexistent',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('createRAIDItem', () => {
    it('should successfully create a new RAID item', async () => {
      const newItem: RAIDItemCreate = {
        type: 'assumption',
        title: 'New Assumption',
        description: 'Testing creation',
        owner: 'test-owner',
        priority: 'medium',
      };

      const createdItem: RAIDItem = {
        ...mockRAIDItem,
        id: 'raid-002',
        type: 'assumption',
        title: 'New Assumption',
        description: 'Testing creation',
        priority: 'medium',
      };

      server.use(
        http.post(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toMatchObject(newItem);
            return HttpResponse.json(createdItem, { status: 201 });
          },
        ),
      );

      const result = await apiClient.createRAIDItem(TEST_PROJECT_KEY, newItem);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('raid-002');
      expect(result.data?.title).toBe('New Assumption');
    });

    it('should handle validation errors', async () => {
      const invalidItem: RAIDItemCreate = {
        type: 'risk',
        title: '', // Invalid: empty title
        description: 'Test',
        owner: 'test',
        priority: 'high',
      };

      server.use(
        http.post(`${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`, () => {
          return HttpResponse.json(
            { detail: 'Validation error: title cannot be empty' },
            { status: 422 },
          );
        }),
      );

      const result = await apiClient.createRAIDItem(
        TEST_PROJECT_KEY,
        invalidItem,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('updateRAIDItem', () => {
    it('should successfully update a RAID item', async () => {
      const update: RAIDItemUpdate = {
        title: 'Updated Title',
        status: 'in_progress',
        priority: 'critical',
      };

      const updatedItem: RAIDItem = {
        ...mockRAIDItem,
        title: 'Updated Title',
        status: 'in_progress',
        priority: 'critical',
        updated_at: '2026-01-31T12:00:00Z',
      };

      server.use(
        http.put(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/${mockRAIDItem.id}`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toMatchObject(update);
            return HttpResponse.json(updatedItem, { status: 200 });
          },
        ),
      );

      const result = await apiClient.updateRAIDItem(
        TEST_PROJECT_KEY,
        mockRAIDItem.id,
        update,
      );

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
      expect(result.data?.status).toBe('in_progress');
    });

    it('should handle conflicts (409)', async () => {
      server.use(
        http.put(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/${mockRAIDItem.id}`,
          () => {
            return HttpResponse.json(
              { detail: 'Item was modified by another user' },
              { status: 409 },
            );
          },
        ),
      );

      const result = await apiClient.updateRAIDItem(
        TEST_PROJECT_KEY,
        mockRAIDItem.id,
        {
          title: 'New Title',
        },
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('deleteRAIDItem', () => {
    it('should successfully delete a RAID item', async () => {
      server.use(
        http.delete(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/${mockRAIDItem.id}`,
          () => {
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );

      const result = await apiClient.deleteRAIDItem(
        TEST_PROJECT_KEY,
        mockRAIDItem.id,
      );

      expect(result.success).toBe(true);
    });

    it('should handle 404 when item already deleted', async () => {
      server.use(
        http.delete(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid/nonexistent`,
          () => {
            return HttpResponse.json(
              { detail: 'RAID item not found' },
              { status: 404 },
            );
          },
        ),
      );

      const result = await apiClient.deleteRAIDItem(
        TEST_PROJECT_KEY,
        'nonexistent',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('Error Retry Logic', () => {
    it('should not retry on client errors (4xx)', async () => {
      let callCount = 0;

      server.use(
        http.get(`${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`, () => {
          callCount++;
          return HttpResponse.json({ detail: 'Bad request' }, { status: 400 });
        }),
      );

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
      expect(callCount).toBe(1); // No retries on client errors
    });
  });

  describe('Response Timeout', () => {
    it.skip('should timeout after 30 seconds', async () => {
      // Skipped: This test takes 30+ seconds which is too long for CI
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/raid`,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 31000));
            return HttpResponse.json({}, { status: 200 });
          },
        ),
      );

      const startTime = Date.now();

      const result = await apiClient.listRAIDItems(TEST_PROJECT_KEY);

      const duration = Date.now() - startTime;
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timeout|timed out/i);
      expect(duration).toBeLessThan(32000); // Should timeout before 32 seconds
    });
  });
});
