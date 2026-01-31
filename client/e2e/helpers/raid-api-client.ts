/**
 * RAID API Client - Single Responsibility: RAID Item Management
 * Handles all RAID-related API operations
 */

import { AxiosInstance } from 'axios';

export interface RAIDItemData {
  type: 'risk' | 'assumption' | 'issue' | 'dependency';
  title: string;
  description: string;
  status?: string;
  priority?: string;
  owner?: string;
}

export interface RAIDFilters {
  type?: string;
  status?: string;
  priority?: string;
}

export interface RAIDItemUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  owner?: string;
}

export class RAIDApiClient {
  constructor(private client: AxiosInstance) {}

  async create(projectKey: string, raidData: RAIDItemData) {
    const response = await this.client.post(
      `/projects/${projectKey}/raid`,
      raidData,
    );
    return response.data;
  }

  async list(projectKey: string, filters?: RAIDFilters) {
    const params = this.buildQueryParams(filters);
    const url = `/projects/${projectKey}/raid${params ? `?${params}` : ''}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async get(projectKey: string, raidId: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/raid/${raidId}`,
    );
    return response.data;
  }

  async update(projectKey: string, raidId: string, updates: RAIDItemUpdate) {
    const response = await this.client.put(
      `/projects/${projectKey}/raid/${raidId}`,
      updates,
    );
    return response.data;
  }

  async delete(projectKey: string, raidId: string): Promise<boolean> {
    try {
      await this.client.delete(`/projects/${projectKey}/raid/${raidId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch create multiple RAID items for testing
   */
  async createBatch(projectKey: string, items: RAIDItemData[]): Promise<void> {
    await Promise.all(items.map((item) => this.create(projectKey, item)));
  }

  private buildQueryParams(filters?: RAIDFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);

    return params.toString();
  }
}
