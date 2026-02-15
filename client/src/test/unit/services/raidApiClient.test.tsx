import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import { ApiError } from '../../../services/errors';
import type {
  RAIDItem,
  RAIDItemCreate,
  RAIDItemList,
  RAIDItemUpdate,
} from '../../../types';

type RaidClientPort = {
  listRAIDItems: (projectKey: string, filters?: object) => Promise<RAIDItemList>;
  getRAIDItem: (projectKey: string, raidId: string) => Promise<RAIDItem>;
  createRAIDItem: (projectKey: string, data: RAIDItemCreate) => Promise<RAIDItem>;
  updateRAIDItem: (
    projectKey: string,
    raidId: string,
    data: RAIDItemUpdate,
  ) => Promise<RAIDItem>;
  deleteRAIDItem: (projectKey: string, raidId: string) => Promise<{ message: string }>;
};

function getRaidClientPort(): RaidClientPort {
  return (apiClient as unknown as { raidClient: RaidClientPort }).raidClient;
}

describe('apiClient RAID compatibility delegation', () => {
  const projectKey = 'TEST_PROJECT';
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
    vi.restoreAllMocks();
  });

  it('delegates listRAIDItems and keeps ApiResponse compatibility', async () => {
    const response: RAIDItemList = { items: [mockRAIDItem], total: 1, filtered_by: null };
    const spy = vi
      .spyOn(getRaidClientPort(), 'listRAIDItems')
      .mockResolvedValue(response);

    const result = await apiClient.listRAIDItems(projectKey);

    expect(spy).toHaveBeenCalledWith(projectKey, undefined);
    expect(result).toEqual({ success: true, data: response });
  });

  it('delegates get/create/update/delete RAID item operations', async () => {
    const createData: RAIDItemCreate = {
      type: 'risk',
      title: 'New Risk',
      description: 'New description',
      owner: 'test-user',
      priority: 'high',
    };
    const updateData: RAIDItemUpdate = { title: 'Updated', status: 'in_progress' };
    const deleted = { message: 'RAID item deleted successfully' };

    const raidClient = getRaidClientPort();
    vi.spyOn(raidClient, 'getRAIDItem').mockResolvedValue(mockRAIDItem);
    vi.spyOn(raidClient, 'createRAIDItem').mockResolvedValue(mockRAIDItem);
    vi.spyOn(raidClient, 'updateRAIDItem').mockResolvedValue({
      ...mockRAIDItem,
      ...updateData,
    });
    vi.spyOn(raidClient, 'deleteRAIDItem').mockResolvedValue(deleted);

    await expect(apiClient.getRAIDItem(projectKey, 'raid-001')).resolves.toEqual({
      success: true,
      data: mockRAIDItem,
    });
    await expect(apiClient.createRAIDItem(projectKey, createData)).resolves.toEqual({
      success: true,
      data: mockRAIDItem,
    });
    await expect(
      apiClient.updateRAIDItem(projectKey, 'raid-001', updateData),
    ).resolves.toEqual({
      success: true,
      data: { ...mockRAIDItem, ...updateData },
    });
    await expect(apiClient.deleteRAIDItem(projectKey, 'raid-001')).resolves.toEqual({
      success: true,
      data: deleted,
    });
  });

  it('maps delegated ApiError into stable message contract', async () => {
    vi.spyOn(getRaidClientPort(), 'getRAIDItem').mockRejectedValue(
      new ApiError({
        type: 'not_found',
        message: 'RAID item does not exist',
        statusCode: 404,
        retryable: false,
      }),
    );

    const result = await apiClient.getRAIDItem(projectKey, 'missing');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RAID item does not exist');
  });

  it('maps unknown delegated failures to Error.message for consistency', async () => {
    vi.spyOn(getRaidClientPort(), 'deleteRAIDItem').mockRejectedValue(
      new Error('Delete failed'),
    );

    const result = await apiClient.deleteRAIDItem(projectKey, 'raid-001');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Delete failed');
  });
});
