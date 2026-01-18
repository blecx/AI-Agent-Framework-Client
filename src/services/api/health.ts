/**
 * Health API Service
 * Handles health check and system status API calls
 */

import { ApiClient } from './client';
import { HealthResponse } from '../../types/api';

export class HealthService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.client.get<HealthResponse>('/health');
  }

  /**
   * Ping API (simple connectivity check)
   */
  async ping(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }
}
