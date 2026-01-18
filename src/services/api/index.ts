/**
 * API Service Layer - Main Entry Point
 * Provides a unified interface to all API services
 */

import { ApiClient, ApiClientConfig } from './client';
import { ProjectsService } from './projects';
import { RAIDService } from './raid';
import { WorkflowService } from './workflow';
import { AuditService } from './audit';
import { GovernanceService } from './governance';
import { HealthService } from './health';

/**
 * Main API Service class
 * Aggregates all service modules and provides a single entry point
 */
export class ApiService {
  private client: ApiClient;

  // Service modules
  public readonly projects: ProjectsService;
  public readonly raid: RAIDService;
  public readonly workflow: WorkflowService;
  public readonly audit: AuditService;
  public readonly governance: GovernanceService;
  public readonly health: HealthService;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);

    // Initialize service modules
    this.projects = new ProjectsService(this.client);
    this.raid = new RAIDService(this.client);
    this.workflow = new WorkflowService(this.client);
    this.audit = new AuditService(this.client);
    this.governance = new GovernanceService(this.client);
    this.health = new HealthService(this.client);
  }

  /**
   * Update API key for authenticated requests
   */
  setApiKey(apiKey: string | undefined): void {
    this.client.setApiKey(apiKey);
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.client.setBaseURL(baseURL);
  }
}

// Export all types and services
export * from './client';
export * from './projects';
export * from './raid';
export * from './workflow';
export * from './audit';
export * from './governance';
export * from './health';

// Default export
export default ApiService;
