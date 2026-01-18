/**
 * Unit Tests for RAIDService
 * Tests RAID-related API calls
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { ApiClient } from '../../../services/api/client';
import { RAIDService } from '../../../services/api/raid';
import {
  RAIDItem,
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../../../types/api';

describe('RAIDService', () => {
  let apiClient: ApiClient;
  let raidService: RAIDService;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'http://localhost:8000',
    });
    raidService = new RAIDService(apiClient);
    // @ts-ignore - accessing private property for testing
    mockAxios = new MockAdapter(apiClient['client']);
  });

  afterEach(() => {
    mockAxios.reset();
    mockAxios.restore();
  });

  describe('listRAIDItems', () => {
    it('should list all RAID items', async () => {
      const raidItems: RAIDItem[] = [
        {
          id: 'RAID001',
          project_key: 'PROJ1',
          type: RAIDType.RISK,
          title: 'Test Risk',
          description: 'Test Description',
          status: RAIDStatus.OPEN,
          priority: RAIDPriority.HIGH,
          created_at: '2026-01-18T00:00:00Z',
          updated_at: '2026-01-18T00:00:00Z',
        },
      ];

      mockAxios.onGet('/api/v1/projects/PROJ1/raid').reply(200, {
        items: raidItems,
        total: 1,
      });

      const result = await raidService.listRAIDItems('PROJ1');
      expect(result.items).toEqual(raidItems);
      expect(result.total).toBe(1);
    });

    it('should filter RAID items by type', async () => {
      mockAxios
        .onGet('/api/v1/projects/PROJ1/raid', {
          params: { type: RAIDType.RISK },
        })
        .reply(200, {
          items: [],
          total: 0,
        });

      const result = await raidService.listRAIDItems('PROJ1', {
        type: RAIDType.RISK,
      });
      expect(result.items).toEqual([]);
    });
  });

  describe('createRAIDItem', () => {
    it('should create new RAID item', async () => {
      const createData = {
        type: RAIDType.RISK,
        title: 'New Risk',
        description: 'Risk description',
        priority: RAIDPriority.HIGH,
      };

      const createdItem: RAIDItem = {
        id: 'RAID001',
        project_key: 'PROJ1',
        ...createData,
        status: RAIDStatus.OPEN,
        created_at: '2026-01-18T00:00:00Z',
        updated_at: '2026-01-18T00:00:00Z',
      };

      mockAxios
        .onPost('/api/v1/projects/PROJ1/raid', createData)
        .reply(201, createdItem);

      const result = await raidService.createRAIDItem('PROJ1', createData);
      expect(result).toEqual(createdItem);
    });
  });
});
