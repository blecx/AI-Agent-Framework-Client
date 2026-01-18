/**
 * Governance API Service
 * Handles governance metadata and decisions API calls
 */

import { ApiClient } from './client';
import {
  GovernanceMetadata,
  GovernanceMetadataCreate,
  GovernanceMetadataUpdate,
  Decision,
  DecisionCreate,
  DecisionUpdate,
  DecisionList,
} from '../../types/api';

export class GovernanceService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  // ==================== Governance Metadata ====================

  /**
   * Get governance metadata for project
   */
  async getGovernanceMetadata(projectKey: string): Promise<GovernanceMetadata> {
    return this.client.get<GovernanceMetadata>(
      `/api/v1/projects/${projectKey}/governance`,
    );
  }

  /**
   * Create governance metadata
   */
  async createGovernanceMetadata(
    projectKey: string,
    metadata: GovernanceMetadataCreate,
  ): Promise<GovernanceMetadata> {
    return this.client.post<GovernanceMetadata, GovernanceMetadataCreate>(
      `/api/v1/projects/${projectKey}/governance`,
      metadata,
    );
  }

  /**
   * Update governance metadata
   */
  async updateGovernanceMetadata(
    projectKey: string,
    update: GovernanceMetadataUpdate,
  ): Promise<GovernanceMetadata> {
    return this.client.put<GovernanceMetadata, GovernanceMetadataUpdate>(
      `/api/v1/projects/${projectKey}/governance`,
      update,
    );
  }

  // ==================== Decisions ====================

  /**
   * List all decisions for project
   */
  async listDecisions(projectKey: string): Promise<DecisionList> {
    return this.client.get<DecisionList>(
      `/api/v1/projects/${projectKey}/decisions`,
    );
  }

  /**
   * Get specific decision
   */
  async getDecision(projectKey: string, decisionId: string): Promise<Decision> {
    return this.client.get<Decision>(
      `/api/v1/projects/${projectKey}/decisions/${decisionId}`,
    );
  }

  /**
   * Create new decision
   */
  async createDecision(
    projectKey: string,
    decision: DecisionCreate,
  ): Promise<Decision> {
    return this.client.post<Decision, DecisionCreate>(
      `/api/v1/projects/${projectKey}/decisions`,
      decision,
    );
  }

  /**
   * Update decision
   */
  async updateDecision(
    projectKey: string,
    decisionId: string,
    update: DecisionUpdate,
  ): Promise<Decision> {
    return this.client.put<Decision, DecisionUpdate>(
      `/api/v1/projects/${projectKey}/decisions/${decisionId}`,
      update,
    );
  }

  /**
   * Delete decision
   */
  async deleteDecision(projectKey: string, decisionId: string): Promise<void> {
    return this.client.delete<void>(
      `/api/v1/projects/${projectKey}/decisions/${decisionId}`,
    );
  }
}
