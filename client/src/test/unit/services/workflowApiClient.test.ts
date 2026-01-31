/**
 * Unit tests for workflow and audit API client methods
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import { WorkflowState, AuditEventType } from '../../../types';
import type {
  WorkflowStateInfo,
  WorkflowStateUpdate,
  AllowedTransitionsResponse,
  AuditEventList,
} from '../../../types';

describe('Workflow API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // Workflow State Tests
  // =========================================================================

  describe('getWorkflowState', () => {
    it('should fetch workflow state successfully', async () => {
      const mockState: WorkflowStateInfo = {
        current_state: WorkflowState.PLANNING,
        previous_state: WorkflowState.INITIATING,
        transition_history: [
          {
            from_state: WorkflowState.INITIATING,
            to_state: WorkflowState.PLANNING,
            timestamp: '2026-01-31T10:00:00Z',
            actor: 'user@example.com',
            reason: 'Project approved',
          },
        ],
        updated_at: '2026-01-31T10:00:00Z',
        updated_by: 'user@example.com',
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockState,
      });

      const result = await apiClient.getWorkflowState('PROJ-001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockState);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/workflow/state',
      );
    });

    it('should handle errors when fetching workflow state', async () => {
      vi.spyOn(apiClient['client'], 'get').mockRejectedValue(
        new Error('Network error'),
      );

      const result = await apiClient.getWorkflowState('PROJ-001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('transitionWorkflowState', () => {
    it('should transition workflow state successfully', async () => {
      const stateUpdate: WorkflowStateUpdate = {
        to_state: WorkflowState.EXECUTING,
        actor: 'user@example.com',
        reason: 'Starting execution phase',
      };

      const mockResponse: WorkflowStateInfo = {
        current_state: WorkflowState.EXECUTING,
        previous_state: WorkflowState.PLANNING,
        transition_history: [
          {
            from_state: WorkflowState.PLANNING,
            to_state: WorkflowState.EXECUTING,
            timestamp: '2026-01-31T11:00:00Z',
            actor: 'user@example.com',
            reason: 'Starting execution phase',
          },
        ],
        updated_at: '2026-01-31T11:00:00Z',
        updated_by: 'user@example.com',
      };

      vi.spyOn(apiClient['client'], 'patch').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.transitionWorkflowState(
        'PROJ-001',
        stateUpdate,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(apiClient['client'].patch).toHaveBeenCalledWith(
        '/projects/PROJ-001/workflow/state',
        stateUpdate,
      );
    });

    it('should handle invalid transition errors', async () => {
      const stateUpdate: WorkflowStateUpdate = {
        to_state: WorkflowState.CLOSED,
        actor: 'user@example.com',
      };

      vi.spyOn(apiClient['client'], 'patch').mockRejectedValue(
        new Error('Invalid transition from planning to closed'),
      );

      const result = await apiClient.transitionWorkflowState(
        'PROJ-001',
        stateUpdate,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
    });

    it('should handle project not found errors', async () => {
      const stateUpdate: WorkflowStateUpdate = {
        to_state: WorkflowState.PLANNING,
      };

      vi.spyOn(apiClient['client'], 'patch').mockRejectedValue(
        new Error('Project not found'),
      );

      const result = await apiClient.transitionWorkflowState(
        'INVALID',
        stateUpdate,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project not found');
    });
  });

  describe('getAllowedTransitions', () => {
    it('should fetch allowed transitions successfully', async () => {
      const mockResponse: AllowedTransitionsResponse = {
        current_state: WorkflowState.PLANNING,
        allowed_transitions: [
          WorkflowState.EXECUTING,
          WorkflowState.INITIATING,
        ],
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAllowedTransitions('PROJ-001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/workflow/allowed-transitions',
      );
    });

    it('should handle errors when fetching allowed transitions', async () => {
      vi.spyOn(apiClient['client'], 'get').mockRejectedValue(
        new Error('Failed to fetch transitions'),
      );

      const result = await apiClient.getAllowedTransitions('PROJ-001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch transitions');
    });

    it('should return empty array for closed state', async () => {
      const mockResponse: AllowedTransitionsResponse = {
        current_state: WorkflowState.CLOSED,
        allowed_transitions: [],
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAllowedTransitions('PROJ-001');

      expect(result.success).toBe(true);
      expect(result.data?.allowed_transitions).toHaveLength(0);
    });
  });

  // =========================================================================
  // Audit Events Tests
  // =========================================================================

  describe('getAuditEvents', () => {
    it('should fetch audit events without filters', async () => {
      const mockResponse: AuditEventList = {
        events: [
          {
            event_id: 'evt-1',
            event_type: AuditEventType.PROJECT_CREATED,
            timestamp: '2026-01-31T10:00:00Z',
            actor: 'user@example.com',
            correlation_id: null,
            project_key: 'PROJ-001',
            payload_summary: { name: 'Test Project' },
            resource_hash: 'abc123',
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
        filtered_by: null,
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/audit-events',
      );
    });

    it('should fetch audit events with event_type filter', async () => {
      const mockResponse: AuditEventList = {
        events: [
          {
            event_id: 'evt-2',
            event_type: AuditEventType.WORKFLOW_STATE_CHANGED,
            timestamp: '2026-01-31T11:00:00Z',
            actor: 'user@example.com',
            correlation_id: 'corr-123',
            project_key: 'PROJ-001',
            payload_summary: {
              from_state: 'planning',
              to_state: 'executing',
            },
            resource_hash: 'def456',
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
        filtered_by: { event_type: 'workflow_state_changed' },
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001', {
        event_type: AuditEventType.WORKFLOW_STATE_CHANGED,
      });

      expect(result.success).toBe(true);
      expect(result.data?.events).toHaveLength(1);
      expect(result.data?.events[0].event_type).toBe(
        AuditEventType.WORKFLOW_STATE_CHANGED,
      );
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/audit-events?event_type=workflow_state_changed',
      );
    });

    it('should fetch audit events with actor filter', async () => {
      const mockResponse: AuditEventList = {
        events: [],
        total: 0,
        limit: 100,
        offset: 0,
        filtered_by: { actor: 'admin@example.com' },
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001', {
        actor: 'admin@example.com',
      });

      expect(result.success).toBe(true);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/audit-events?actor=admin%40example.com',
      );
    });

    it('should fetch audit events with time range filters', async () => {
      const mockResponse: AuditEventList = {
        events: [],
        total: 0,
        limit: 100,
        offset: 0,
        filtered_by: null,
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001', {
        since: '2026-01-01T00:00:00Z',
        until: '2026-01-31T23:59:59Z',
      });

      expect(result.success).toBe(true);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/audit-events?since=2026-01-01T00%3A00%3A00Z&until=2026-01-31T23%3A59%3A59Z',
      );
    });

    it('should fetch audit events with pagination', async () => {
      const mockResponse: AuditEventList = {
        events: [],
        total: 150,
        limit: 50,
        offset: 100,
        filtered_by: null,
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001', {
        limit: 50,
        offset: 100,
      });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(50);
      expect(result.data?.offset).toBe(100);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        '/projects/PROJ-001/audit-events?limit=50&offset=100',
      );
    });

    it('should fetch audit events with all filters combined', async () => {
      const mockResponse: AuditEventList = {
        events: [],
        total: 0,
        limit: 20,
        offset: 0,
        filtered_by: null,
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.getAuditEvents('PROJ-001', {
        event_type: AuditEventType.RAID_ITEM_CREATED,
        actor: 'user@example.com',
        since: '2026-01-01T00:00:00Z',
        until: '2026-01-31T23:59:59Z',
        limit: 20,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        expect.stringContaining('/projects/PROJ-001/audit-events?'),
      );
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        expect.stringContaining('event_type=raid_item_created'),
      );
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        expect.stringContaining('actor=user%40example.com'),
      );
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20'),
      );
    });

    it('should handle errors when fetching audit events', async () => {
      vi.spyOn(apiClient['client'], 'get').mockRejectedValue(
        new Error('Database connection failed'),
      );

      const result = await apiClient.getAuditEvents('PROJ-001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
