/**
 * Integration tests for Workflow and Audit API Client
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
import { WorkflowState, AuditEventType } from '../../../types';
import type {
  WorkflowStateInfo,
  WorkflowStateUpdate,
  AllowedTransitionsResponse,
  AuditEventList,
  AuditEvent,
} from '../../../types';

const API_BASE_URL = 'http://localhost:8000';
const TEST_PROJECT_KEY = 'TEST_PROJ';

// Mock data
const mockWorkflowState: WorkflowStateInfo = {
  current_state: WorkflowState.PLANNING,
  previous_state: WorkflowState.INITIATING,
  transition_history: [
    {
      from_state: WorkflowState.INITIATING,
      to_state: WorkflowState.PLANNING,
      timestamp: '2026-01-31T10:00:00Z',
      actor: 'integration-tester',
      reason: 'Project approved and ready for planning',
    },
  ],
  updated_at: '2026-01-31T10:00:00Z',
  updated_by: 'integration-tester',
};

const mockAuditEvent: AuditEvent = {
  event_id: 'audit-001',
  project_key: TEST_PROJECT_KEY,
  event_type: AuditEventType.WORKFLOW_STATE_CHANGED,
  actor: 'integration-tester',
  timestamp: '2026-01-31T10:00:00Z',
  payload_summary: {
    from_state: WorkflowState.INITIATING,
    to_state: WorkflowState.PLANNING,
    reason: 'Project approved',
  },
  correlation_id: null,
  resource_hash: null,
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

describe('Workflow API Client Integration Tests', () => {
  describe('getWorkflowState', () => {
    it('should successfully fetch workflow state', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(mockWorkflowState, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getWorkflowState(TEST_PROJECT_KEY);

      expect(result.success).toBe(true);
      expect(result.data?.current_state).toBe(WorkflowState.PLANNING);
      expect(result.data?.previous_state).toBe(WorkflowState.INITIATING);
      expect(result.data?.transition_history).toHaveLength(1);
    });

    it('should handle 404 when project not found', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(
              { detail: 'Project not found' },
              { status: 404 },
            );
          },
        ),
      );

      const result = await apiClient.getWorkflowState(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });

    it('should handle server errors gracefully', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(
              { detail: 'Database connection failed' },
              { status: 500 },
            );
          },
        ),
      );

      const result = await apiClient.getWorkflowState(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    }, 10000); // Increased timeout for retry logic (PR #122 added 3 retries with exponential backoff)
  });

  describe('transitionWorkflowState', () => {
    it('should successfully transition workflow state', async () => {
      const stateUpdate: WorkflowStateUpdate = {
        to_state: WorkflowState.EXECUTING,
        actor: 'integration-tester',
        reason: 'Starting execution phase',
      };

      const updatedState: WorkflowStateInfo = {
        current_state: WorkflowState.EXECUTING,
        previous_state: WorkflowState.PLANNING,
        transition_history: [
          ...mockWorkflowState.transition_history,
          {
            from_state: WorkflowState.PLANNING,
            to_state: WorkflowState.EXECUTING,
            timestamp: '2026-01-31T11:00:00Z',
            actor: 'integration-tester',
            reason: 'Starting execution phase',
          },
        ],
        updated_at: '2026-01-31T11:00:00Z',
        updated_by: 'integration-tester',
      };

      server.use(
        http.patch(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toMatchObject(stateUpdate);
            return HttpResponse.json(updatedState, { status: 200 });
          },
        ),
      );

      const result = await apiClient.transitionWorkflowState(
        TEST_PROJECT_KEY,
        stateUpdate,
      );

      expect(result.success).toBe(true);
      expect(result.data?.current_state).toBe(WorkflowState.EXECUTING);
      expect(result.data?.previous_state).toBe(WorkflowState.PLANNING);
    });

    it('should handle invalid transition (400)', async () => {
      const invalidTransition: WorkflowStateUpdate = {
        to_state: WorkflowState.CLOSING,
        actor: 'integration-tester',
        reason: 'Invalid jump',
      };

      server.use(
        http.patch(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(
              {
                detail:
                  'Invalid transition: Cannot transition from Planning to Closing',
              },
              { status: 400 },
            );
          },
        ),
      );

      const result = await apiClient.transitionWorkflowState(
        TEST_PROJECT_KEY,
        invalidTransition,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });

    it('should validate required fields', async () => {
      const incompleteUpdate = {
        to_state: WorkflowState.EXECUTING,
        // Missing actor and reason
      } as WorkflowStateUpdate;

      server.use(
        http.patch(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(
              { detail: 'Validation error: actor is required' },
              { status: 422 },
            );
          },
        ),
      );

      const result = await apiClient.transitionWorkflowState(
        TEST_PROJECT_KEY,
        incompleteUpdate,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });

    it('should handle concurrent modification conflicts', async () => {
      const stateUpdate: WorkflowStateUpdate = {
        to_state: WorkflowState.EXECUTING,
        actor: 'user1',
        reason: 'Test',
      };

      server.use(
        http.patch(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/state`,
          () => {
            return HttpResponse.json(
              {
                detail: 'Conflict: Workflow state was modified by another user',
              },
              { status: 409 },
            );
          },
        ),
      );

      const result = await apiClient.transitionWorkflowState(
        TEST_PROJECT_KEY,
        stateUpdate,
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('getAllowedTransitions', () => {
    it('should fetch allowed transitions for current state', async () => {
      const allowedTransitions: AllowedTransitionsResponse = {
        current_state: WorkflowState.PLANNING,
        allowed_transitions: [
          WorkflowState.EXECUTING,
          WorkflowState.INITIATING,
        ],
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/workflow/allowed-transitions`,
          () => {
            return HttpResponse.json(allowedTransitions, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getAllowedTransitions(TEST_PROJECT_KEY);

      expect(result.success).toBe(true);
      expect(result.data?.current_state).toBe(WorkflowState.PLANNING);
      expect(result.data?.allowed_transitions).toHaveLength(2);
      expect(result.data?.allowed_transitions[0]).toBe(WorkflowState.EXECUTING);
    });

    it('should handle 404 for non-existent project', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/NONEXISTENT/workflow/allowed-transitions`,
          () => {
            return HttpResponse.json(
              { detail: 'Project not found' },
              { status: 404 },
            );
          },
        ),
      );

      const result = await apiClient.getAllowedTransitions('NONEXISTENT');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });
});

describe('Audit API Client Integration Tests', () => {
  describe('getAuditEvents', () => {
    it('should fetch audit events without filters', async () => {
      const mockResponse: AuditEventList = {
        events: [mockAuditEvent],
        total: 1,
        limit: 20,
        offset: 0,
        filtered_by: null,
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          () => {
            return HttpResponse.json(mockResponse, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY);

      expect(result.success).toBe(true);
      expect(result.data?.events).toHaveLength(1);
      expect(result.data?.events[0].event_type).toBe(
        AuditEventType.WORKFLOW_STATE_CHANGED,
      );
    });

    it('should apply event type filter', async () => {
      const mockFilteredResponse: AuditEventList = {
        events: [mockAuditEvent],
        total: 1,
        limit: 20,
        offset: 0,
        filtered_by: {
          event_type: AuditEventType.WORKFLOW_STATE_CHANGED,
        },
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('event_type')).toBe(
              AuditEventType.WORKFLOW_STATE_CHANGED,
            );
            return HttpResponse.json(mockFilteredResponse, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY, {
        event_type: AuditEventType.WORKFLOW_STATE_CHANGED,
      });

      expect(result.success).toBe(true);
      expect(result.data?.filtered_by?.event_type).toBe(
        AuditEventType.WORKFLOW_STATE_CHANGED,
      );
    });

    it('should apply actor filter', async () => {
      const mockFilteredResponse: AuditEventList = {
        events: [mockAuditEvent],
        total: 1,
        limit: 20,
        offset: 0,
        filtered_by: {
          actor: 'integration-tester',
        },
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('actor')).toBe('integration-tester');
            return HttpResponse.json(mockFilteredResponse, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY, {
        actor: 'integration-tester',
      });

      expect(result.success).toBe(true);
      expect(result.data?.filtered_by?.actor).toBe('integration-tester');
    });

    it('should apply date range filters', async () => {
      const since = '2026-01-01T00:00:00Z';
      const until = '2026-01-31T23:59:59Z';

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('since')).toBe(since);
            expect(url.searchParams.get('until')).toBe(until);
            return HttpResponse.json(
              { events: [], total: 0, limit: 20, offset: 0, filtered_by: null },
              { status: 200 },
            );
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY, {
        since,
        until,
      });

      expect(result.success).toBe(true);
    });

    it('should handle empty audit log', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          () => {
            return HttpResponse.json(
              { events: [], total: 0, limit: 20, offset: 0, filtered_by: null },
              { status: 200 },
            );
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY);

      expect(result.success).toBe(true);
      expect(result.data?.events).toHaveLength(0);
      expect(result.data?.total).toBe(0);
    });

    it('should handle 403 forbidden access', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          () => {
            return HttpResponse.json(
              { detail: 'Insufficient permissions to view audit log' },
              { status: 403 },
            );
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy(); // Contains error details
    });
  });

  describe('Pagination Support', () => {
    it('should handle paginated audit results', async () => {
      const mockPage1: AuditEventList = {
        events: [mockAuditEvent],
        total: 50,
        limit: 20,
        offset: 0,
        filtered_by: null,
      };

      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          ({ request }) => {
            const url = new URL(request.url);
            const limit = url.searchParams.get('limit') || '20';
            const offset = url.searchParams.get('offset') || '0';

            expect(limit).toBe('20');
            expect(offset).toBe('0');

            return HttpResponse.json(mockPage1, { status: 200 });
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY, {
        limit: 20,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data?.total).toBe(50);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed response structure', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          () => {
            return HttpResponse.json(
              { wrong: 'structure' }, // Valid JSON but missing required fields
              { status: 200 },
            );
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY);
      // Should still return success=true but with unexpected data structure
      // This test verifies the response doesn't crash, not that it validates structure
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle network failures', async () => {
      server.use(
        http.get(
          `${API_BASE_URL}/projects/${TEST_PROJECT_KEY}/audit-events`,
          () => {
            return HttpResponse.error();
          },
        ),
      );

      const result = await apiClient.getAuditEvents(TEST_PROJECT_KEY);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    }, 10000); // Increased timeout for retry logic (PR #122 added 3 retries with exponential backoff)
  });
});
