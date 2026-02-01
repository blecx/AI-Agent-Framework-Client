/**
 * Proposal API Client
 * Domain-specific client for proposal operations (SRP compliance)
 */

import axios, { type AxiosInstance } from 'axios';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export type ChangeType = 'create' | 'update' | 'delete';

export interface Proposal {
  id: string;
  project_key: string;
  target_artifact: string;
  change_type: ChangeType;
  diff: string;
  rationale: string;
  status: ProposalStatus;
  author: string;
  created_at: string;
  applied_at?: string;
}

export interface ProposalCreate {
  id: string;
  target_artifact: string;
  change_type: ChangeType;
  diff: string;
  rationale: string;
  author?: string;
}

export class ProposalApiClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string) {
    const apiBaseUrl =
      baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    projectKey: string,
    proposal: ProposalCreate,
  ): Promise<Proposal> {
    const response = await this.client.post<Proposal>(
      `/api/v1/projects/${projectKey}/proposals`,
      proposal,
    );
    return response.data;
  }

  /**
   * List all proposals for a project
   */
  async listProposals(
    projectKey: string,
    statusFilter?: ProposalStatus,
    changeType?: ChangeType,
  ): Promise<Proposal[]> {
    const params: Record<string, string> = {};
    if (statusFilter) params.status_filter = statusFilter;
    if (changeType) params.change_type = changeType;

    const response = await this.client.get<Proposal[]>(
      `/api/v1/projects/${projectKey}/proposals`,
      { params },
    );
    return response.data;
  }

  /**
   * Get a specific proposal by ID
   */
  async getProposal(projectKey: string, proposalId: string): Promise<Proposal> {
    const response = await this.client.get<Proposal>(
      `/api/v1/projects/${projectKey}/proposals/${proposalId}`,
    );
    return response.data;
  }

  /**
   * Apply a proposal (accept and merge changes)
   */
  async applyProposal(projectKey: string, proposalId: string): Promise<void> {
    await this.client.post(
      `/api/v1/projects/${projectKey}/proposals/${proposalId}/apply`,
    );
  }

  /**
   * Reject a proposal with optional reason
   */
  async rejectProposal(
    projectKey: string,
    proposalId: string,
    reason?: string,
  ): Promise<void> {
    await this.client.post(
      `/api/v1/projects/${projectKey}/proposals/${proposalId}/reject`,
      { reason },
    );
  }
}

// Singleton instance
export const proposalApiClient = new ProposalApiClient();
