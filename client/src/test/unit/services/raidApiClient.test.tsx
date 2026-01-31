import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import type {
  RAIDItem,
  RAIDItemCreate,
  RAIDItemUpdate,
  RAIDItemList,
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../../../types';

describe('RAID API Service', () => {
  const mockProjectKey = 'TEST_PROJECT';
  const mockRAIDItem: RAIDItem = {
    id: 'raid-001',
    type: 'risk',
    title: 'Test Risk',
    description: 'Test description',
    status: 'open',
    owner: 'test-user',
    priority: 'high',
    impact: 'high',
    likelihood: 'likely',
    mitigation_plan: 'Test mitigation',
    next_actions: ['Action 1'],
    linked_decisions: [],
    linked_change_requests: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'test-user',
    updated_by: 'test-user',
    target_resolution_date: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRAIDItems', () => {
    it('should list RAID items without filters', async () => {
      const mockResponse: RAIDItemList = {
        items: [mockRAIDItem],
        total: 1,
        filtered_by: null,
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.listRAIDItems(mockProjectKey);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid`,
      );
    });

    it('should list RAID items with filters', async () => {
      const filters: {
        type?: RAIDType;
        status?: RAIDStatus;
        owner?: string;
        priority?: RAIDPriority;
      } = {
        type: 'risk',
        status: 'open',
        owner: 'test-user',
        priority: 'high',
      };

      const mockResponse: RAIDItemList = {
        items: [mockRAIDItem],
        total: 1,
        filtered_by: {
          type: 'risk',
          status: 'open',
          owner: 'test-user',
          priority: 'high',
        },
      };

      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockResponse,
      });

      const result = await apiClient.listRAIDItems(mockProjectKey, filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid?type=risk&status=open&owner=test-user&priority=high`,
      );
    });

    it('should handle errors when listing RAID items', async () => {
      vi.spyOn(apiClient['client'], 'get').mockRejectedValue(
        new Error('Network error'),
      );

      const result = await apiClient.listRAIDItems(mockProjectKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getRAIDItem', () => {
    it('should get a specific RAID item', async () => {
      vi.spyOn(apiClient['client'], 'get').mockResolvedValue({
        data: mockRAIDItem,
      });

      const result = await apiClient.getRAIDItem(mockProjectKey, 'raid-001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRAIDItem);
      expect(apiClient['client'].get).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid/raid-001`,
      );
    });

    it('should handle errors when getting RAID item', async () => {
      vi.spyOn(apiClient['client'], 'get').mockRejectedValue(
        new Error('RAID item not found'),
      );

      const result = await apiClient.getRAIDItem(mockProjectKey, 'raid-999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RAID item not found');
    });
  });

  describe('createRAIDItem', () => {
    it('should create a new RAID item', async () => {
      const createData: RAIDItemCreate = {
        type: 'risk',
        title: 'New Risk',
        description: 'New description',
        owner: 'test-user',
        priority: 'high',
      };

      vi.spyOn(apiClient['client'], 'post').mockResolvedValue({
        data: mockRAIDItem,
      });

      const result = await apiClient.createRAIDItem(mockProjectKey, createData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRAIDItem);
      expect(apiClient['client'].post).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid`,
        createData,
      );
    });

    it('should handle errors when creating RAID item', async () => {
      const createData: RAIDItemCreate = {
        type: 'risk',
        title: 'New Risk',
        description: 'New description',
        owner: 'test-user',
      };

      vi.spyOn(apiClient['client'], 'post').mockRejectedValue(
        new Error('Validation error'),
      );

      const result = await apiClient.createRAIDItem(mockProjectKey, createData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });
  });

  describe('updateRAIDItem', () => {
    it('should update an existing RAID item', async () => {
      const updateData: RAIDItemUpdate = {
        title: 'Updated Risk',
        status: 'in_progress',
      };

      const updatedItem = { ...mockRAIDItem, ...updateData };

      vi.spyOn(apiClient['client'], 'put').mockResolvedValue({
        data: updatedItem,
      });

      const result = await apiClient.updateRAIDItem(
        mockProjectKey,
        'raid-001',
        updateData,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedItem);
      expect(apiClient['client'].put).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid/raid-001`,
        updateData,
      );
    });

    it('should handle errors when updating RAID item', async () => {
      const updateData: RAIDItemUpdate = {
        status: 'closed',
      };

      vi.spyOn(apiClient['client'], 'put').mockRejectedValue(
        new Error('Update failed'),
      );

      const result = await apiClient.updateRAIDItem(
        mockProjectKey,
        'raid-001',
        updateData,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteRAIDItem', () => {
    it('should delete a RAID item', async () => {
      const mockDeleteResponse = { message: 'RAID item deleted successfully' };

      vi.spyOn(apiClient['client'], 'delete').mockResolvedValue({
        data: mockDeleteResponse,
      });

      const result = await apiClient.deleteRAIDItem(mockProjectKey, 'raid-001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeleteResponse);
      expect(apiClient['client'].delete).toHaveBeenCalledWith(
        `/projects/${mockProjectKey}/raid/raid-001`,
      );
    });

    it('should handle errors when deleting RAID item', async () => {
      vi.spyOn(apiClient['client'], 'delete').mockRejectedValue(
        new Error('Delete failed'),
      );

      const result = await apiClient.deleteRAIDItem(mockProjectKey, 'raid-001');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });
});
