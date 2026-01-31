/**
 * API Client Factory - Single Responsibility: Client Creation and Configuration
 * Creates and configures API clients with shared axios instance
 */

import axios, { AxiosInstance } from 'axios';
import { ProjectApiClient } from './project-api-client';
import { RAIDApiClient } from './raid-api-client';
import { WorkflowApiClient } from './workflow-api-client';

export class ApiClientFactory {
  private client: AxiosInstance;
  private baseUrl: string;

  public readonly projects: ProjectApiClient;
  public readonly raid: RAIDApiClient;
  public readonly workflow: WorkflowApiClient;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || process.env.API_BASE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize specialized clients
    this.projects = new ProjectApiClient(this.client);
    this.raid = new RAIDApiClient(this.client);
    this.workflow = new WorkflowApiClient(this.client);
  }

  /**
   * Check if API is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Wait for API to be ready
   */
  async waitForReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 1000;

    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkHealth()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    return false;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

/**
 * Factory function for creating API client
 */
export const createApiClient = (baseUrl?: string): ApiClientFactory => {
  return new ApiClientFactory(baseUrl);
};
