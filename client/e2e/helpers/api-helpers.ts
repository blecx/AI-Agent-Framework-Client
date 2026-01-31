/**
 * API helper functions for E2E tests
 * Direct API calls for setup and teardown
 */

import axios, { AxiosInstance } from 'axios';

export class E2EApiHelper {
  private client: AxiosInstance;
  private baseUrl: string;

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
  async waitForApi(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkHealth()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  }

  /**
   * Create a project directly via API (for test setup)
   */
  async createProject(key: string, name: string, description?: string) {
    const response = await this.client.post('/projects', {
      key,
      name,
      description,
    });
    return response.data;
  }

  /**
   * Delete a project (for test cleanup)
   */
  async deleteProject(key: string) {
    try {
      await this.client.delete(`/projects/${key}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get project
   */
  async getProject(key: string) {
    const response = await this.client.get(`/projects/${key}`);
    return response.data;
  }

  /**
   * List all projects
   */
  async listProjects() {
    const response = await this.client.get('/projects');
    return response.data;
  }

  /**
   * Create a proposal
   */
  async createProposal(projectKey: string, proposalData: object) {
    const response = await this.client.post(
      `/projects/${projectKey}/proposals`,
      proposalData,
    );
    return response.data;
  }

  /**
   * Get proposals for a project
   */
  async getProposals(projectKey: string) {
    const response = await this.client.get(`/projects/${projectKey}/proposals`);
    return response.data;
  }

  /**
   * Apply a proposal
   */
  async applyProposal(projectKey: string, proposalId: string) {
    const response = await this.client.post(
      `/projects/${projectKey}/proposals/${proposalId}/apply`,
    );
    return response.data;
  }

  /**
   * Clean up test projects (remove all projects with test prefix)
   */
  async cleanupTestProjects(prefix: string = 'e2e-') {
    try {
      const projects = await this.listProjects();
      const testProjects = projects.filter((p: { key: string }) =>
        p.key.startsWith(prefix),
      );

      for (const project of testProjects) {
        await this.deleteProject(project.key);
      }
      return true;
    } catch (error) {
      console.error('Error cleaning up test projects:', error);
      return false;
    }
  }

  // ============================================================================
  // RAID API Methods
  // ============================================================================

  /**
   * Create a RAID item
   */
  async createRAIDItem(
    projectKey: string,
    raidData: {
      type: 'risk' | 'assumption' | 'issue' | 'dependency';
      title: string;
      description: string;
      status?: string;
      priority?: string;
      owner?: string;
    },
  ) {
    const response = await this.client.post(
      `/projects/${projectKey}/raid`,
      raidData,
    );
    return response.data;
  }

  /**
   * Get RAID items for a project
   */
  async getRAIDItems(
    projectKey: string,
    filters?: {
      type?: string;
      status?: string;
      priority?: string;
    },
  ) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const queryString = params.toString();
    const url = `/projects/${projectKey}/raid${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Get a specific RAID item
   */
  async getRAIDItem(projectKey: string, raidId: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/raid/${raidId}`,
    );
    return response.data;
  }

  /**
   * Update a RAID item
   */
  async updateRAIDItem(
    projectKey: string,
    raidId: string,
    updates: Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      owner: string;
    }>,
  ) {
    const response = await this.client.put(
      `/projects/${projectKey}/raid/${raidId}`,
      updates,
    );
    return response.data;
  }

  /**
   * Delete a RAID item
   */
  async deleteRAIDItem(projectKey: string, raidId: string) {
    try {
      await this.client.delete(`/projects/${projectKey}/raid/${raidId}`);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Workflow API Methods
  // ============================================================================

  /**
   * Get workflow state for a project
   */
  async getWorkflowState(projectKey: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/workflow/state`,
    );
    return response.data;
  }

  /**
   * Transition workflow state
   */
  async transitionWorkflowState(
    projectKey: string,
    toState: string,
    actor?: string,
    reason?: string,
  ) {
    const response = await this.client.patch(
      `/projects/${projectKey}/workflow/state`,
      {
        to_state: toState,
        actor: actor || 'e2e-test',
        reason: reason || 'E2E test transition',
      },
    );
    return response.data;
  }

  /**
   * Get allowed transitions for a project's current state
   */
  async getAllowedTransitions(projectKey: string) {
    const response = await this.client.get(
      `/projects/${projectKey}/workflow/allowed-transitions`,
    );
    return response.data;
  }

  /**
   * Get audit events for a project
   */
  async getAuditEvents(
    projectKey: string,
    filters?: {
      event_type?: string;
      limit?: number;
    },
  ) {
    const params = new URLSearchParams();
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/projects/${projectKey}/workflow/audit${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get(url);
    return response.data;
  }
}

export const createApiHelper = (baseUrl?: string) => new E2EApiHelper(baseUrl);
