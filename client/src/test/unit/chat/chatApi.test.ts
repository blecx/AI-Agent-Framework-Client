/**
 * Unit tests for chat API integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeCommand,
  formatApiError,
  canExecuteCommand,
} from '../../../chat/chatApi';
import { CommandType, type CreateRAIDState, type EditRAIDState } from '../../../chat/types';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../../types/raid';
import * as apiClientModule from '../../../services/apiClient';

// Mock the apiClient
vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    createRAIDItem: vi.fn(),
    updateRAIDItem: vi.fn(),
  },
}));

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeCommand', () => {
    it('should reject incomplete conversation', async () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {},
        steps: [{field: 'title', prompt: 'Title?', required: true}, {field: 'description', prompt: 'Description?', required: true}],
        currentStep: 0, // Not at end yet
      };

      const result = await executeCommand(state);

      expect(result.success).toBe(false);
      expect(result.message.content).toContain('not complete');
      expect(result.error).toBe('Incomplete conversation');
    });

    it('should execute CREATE_RAID successfully', async () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {
          type: RAIDType.RISK,
          title: 'Security Risk',
          description: 'SQL injection vulnerability',
          priority: RAIDPriority.HIGH,
          status: RAIDStatus.OPEN,
          owner: 'John Doe',
        },
        steps: [{field: 'title', prompt: 'Title?', required: true}, {field: 'description', prompt: 'Description?', required: true}],
        currentStep: 2, // All steps complete
      };

      const mockRAIDItem = {
        id: 'RISK-001',
        projectKey: 'PROJ-001',
        type: RAIDType.RISK,
        title: 'Security Risk',
        description: 'SQL injection vulnerability',
        priority: RAIDPriority.HIGH,
        status: RAIDStatus.OPEN,
        owner: 'John Doe',
        impact: null,
        likelihood: null,
        mitigation_plan: null,
        next_actions: null,
        resolution: null,
        reviewed_by: null,
        reviewed_at: null,
        closed_at: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(apiClientModule.apiClient, 'createRAIDItem').mockResolvedValue({
        success: true,
        data: mockRAIDItem,
      });

      const result = await executeCommand(state);

      expect(result.success).toBe(true);
      expect(result.message.role).toBe('assistant');
      expect(result.message.content).toContain('Created risk');
      expect(result.message.content).toContain('RISK-001');
      expect(result.message.content).toContain('Security Risk');
      expect(result.data).toEqual(mockRAIDItem);
    });

    it('should handle CREATE_RAID API failure', async () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {
          type: RAIDType.RISK,
          title: 'Test Risk',
          description: 'Test description',
        },
        steps: [{field: 'title', prompt: 'Title?', required: true}],
        currentStep: 1,
      };

      vi.spyOn(apiClientModule.apiClient, 'createRAIDItem').mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const result = await executeCommand(state);

      expect(result.success).toBe(false);
      expect(result.message.content).toContain('Failed to create');
      expect(result.message.content).toContain('Database connection failed');
      expect(result.error).toBe('Database connection failed');
    });

    it('should validate required fields for CREATE_RAID', async () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {
          type: RAIDType.RISK,
          title: 'Test Risk',
          // Missing description
        },
        steps: [],
        currentStep: 0,
      };

      const result = await executeCommand(state);

      expect(result.success).toBe(false);
      expect(result.message.content).toContain('Missing required fields');
    });

    it('should use default values for optional fields', async () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.ASSUMPTION,
        collectedData: {
          type: RAIDType.ASSUMPTION,
          title: 'Test Assumption',
          description: 'Test description',
          // No priority, status, or owner
        },
        steps: [],
        currentStep: 0,
      };

      const mockRAIDItem = {
        id: 'ASSUMPTION-001',
        projectKey: 'PROJ-001',
        type: RAIDType.ASSUMPTION,
        title: 'Test Assumption',
        description: 'Test description',
        priority: RAIDPriority.MEDIUM,
        status: RAIDStatus.OPEN,
        owner: null,
        impact: null,
        likelihood: null,
        mitigation_plan: null,
        next_actions: null,
        resolution: null,
        reviewed_by: null,
        reviewed_at: null,
        closed_at: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createSpy = vi
        .spyOn(apiClientModule.apiClient, 'createRAIDItem')
        .mockResolvedValue({
          success: true,
          data: mockRAIDItem,
        });

      const result = await executeCommand(state);

      expect(result.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith('PROJ-001', {
        type: RAIDType.ASSUMPTION,
        title: 'Test Assumption',
        description: 'Test description',
        status: 'OPEN',
        priority: 'MEDIUM',
        owner: undefined,
      });
    });

    it('should execute EDIT_RAID successfully', async () => {
      const state: EditRAIDState = {
        intent: CommandType.EDIT_RAID,
        projectKey: 'PROJ-001',
        raidId: 'RISK-001',
        updates: {
          status: RAIDStatus.CLOSED,
          priority: RAIDPriority.LOW,
        },
        steps: [{field: 'status', prompt: 'Status?', required: true}],
        currentStep: 1,
      };

      const mockRAIDItem = {
        id: 'RISK-001',
        projectKey: 'PROJ-001',
        type: RAIDType.RISK,
        title: 'Security Risk',
        description: 'SQL injection vulnerability',
        priority: RAIDPriority.LOW,
        status: RAIDStatus.CLOSED,
        owner: null,
        impact: null,
        likelihood: null,
        mitigation_plan: null,
        next_actions: null,
        resolution: null,
        reviewed_by: null,
        reviewed_at: null,
        closed_at: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(apiClientModule.apiClient, 'updateRAIDItem').mockResolvedValue({
        success: true,
        data: mockRAIDItem,
      });

      const result = await executeCommand(state);

      expect(result.success).toBe(true);
      expect(result.message.content).toContain('Updated risk');
      expect(result.message.content).toContain('RISK-001');
      expect(result.data).toEqual(mockRAIDItem);
    });

    it('should handle EDIT_RAID without ID', async () => {
      const state: EditRAIDState = {
        intent: CommandType.EDIT_RAID,
        projectKey: 'PROJ-001',
        raidId: '',
        updates: { status: RAIDStatus.CLOSED },
        steps: [],
        currentStep: 0,
      };

      const result = await executeCommand(state);

      expect(result.success).toBe(false);
      expect(result.message.content).toContain('No RAID item ID');
      expect(result.error).toBe('Missing RAID ID');
    });
  });

  describe('formatApiError', () => {
    it('should format error message for chat', () => {
      const message = formatApiError('Connection timeout');

      expect(message.role).toBe('assistant');
      expect(message.content).toContain('❌');
      expect(message.content).toContain('Error');
      expect(message.content).toContain('Connection timeout');
      expect(message.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('canExecuteCommand', () => {
    it('should return false for null state', () => {
      expect(canExecuteCommand(null)).toBe(false);
    });

    it('should return false for incomplete conversation', () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {},
        steps: [{field: 'title', prompt: 'Title?', required: true}],
        currentStep: 0, // Not complete
      };

      expect(canExecuteCommand(state)).toBe(false);
    });

    it('should return true for complete CREATE_RAID', () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {
          type: RAIDType.RISK,
          title: 'Test Risk',
          description: 'Test description',
        },
        steps: [],
        currentStep: 0, // All steps done (0 steps)
      };

      expect(canExecuteCommand(state)).toBe(true);
    });

    it('should return false for CREATE_RAID missing required fields', () => {
      const state: CreateRAIDState = {
        intent: CommandType.CREATE_RAID,
        projectKey: 'PROJ-001',
        raidType: RAIDType.RISK,
        collectedData: {
          type: RAIDType.RISK,
          title: 'Test Risk',
          // Missing description
        },
        steps: [],
        currentStep: 0,
      };

      expect(canExecuteCommand(state)).toBe(false);
    });

    it('should return true for complete EDIT_RAID', () => {
      const state: EditRAIDState = {
        intent: CommandType.EDIT_RAID,
        projectKey: 'PROJ-001',
        raidId: 'RISK-001',
        updates: { status: RAIDStatus.CLOSED },
        steps: [],
        currentStep: 0,
      };

      expect(canExecuteCommand(state)).toBe(true);
    });

    it('should return false for EDIT_RAID missing ID', () => {
      const state: EditRAIDState = {
        intent: CommandType.EDIT_RAID,
        projectKey: 'PROJ-001',
        raidId: '',
        updates: { status: RAIDStatus.CLOSED },
        steps: [],
        currentStep: 0,
      };

      expect(canExecuteCommand(state)).toBe(false);
    });

    it('should return false for EDIT_RAID with no updates', () => {
      const state: EditRAIDState = {
        intent: CommandType.EDIT_RAID,
        projectKey: 'PROJ-001',
        raidId: 'RISK-001',
        updates: {},
        steps: [],
        currentStep: 0,
      };

      expect(canExecuteCommand(state)).toBe(false);
    });
  });
});
