/**
 * RAID API Service
 * Handles RAID (Risks, Assumptions, Issues, Dependencies) API calls
 */

import { ApiClient } from './client';
import {
  RAIDItem,
  RAIDItemCreate,
  RAIDItemUpdate,
  RAIDItemList,
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../../types/api';

export interface RAIDQueryParams {
  type?: RAIDType;
  status?: RAIDStatus;
  priority?: RAIDPriority;
  owner?: string;
  limit?: number;
  offset?: number;
}

export class RAIDService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * List RAID items with optional filters
   */
  async listRAIDItems(
    projectKey: string,
    params?: RAIDQueryParams,
  ): Promise<RAIDItemList> {
    return this.client.get<RAIDItemList>(
      `/api/v1/projects/${projectKey}/raid`,
      { params },
    );
  }

  /**
   * Get specific RAID item
   */
  async getRAIDItem(projectKey: string, raidId: string): Promise<RAIDItem> {
    return this.client.get<RAIDItem>(
      `/api/v1/projects/${projectKey}/raid/${raidId}`,
    );
  }

  /**
   * Create new RAID item
   */
  async createRAIDItem(
    projectKey: string,
    item: RAIDItemCreate,
  ): Promise<RAIDItem> {
    return this.client.post<RAIDItem, RAIDItemCreate>(
      `/api/v1/projects/${projectKey}/raid`,
      item,
    );
  }

  /**
   * Update RAID item
   */
  async updateRAIDItem(
    projectKey: string,
    raidId: string,
    update: RAIDItemUpdate,
  ): Promise<RAIDItem> {
    return this.client.put<RAIDItem, RAIDItemUpdate>(
      `/api/v1/projects/${projectKey}/raid/${raidId}`,
      update,
    );
  }

  /**
   * Delete RAID item
   */
  async deleteRAIDItem(projectKey: string, raidId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/projects/${projectKey}/raid/${raidId}`,
    );
  }
}
