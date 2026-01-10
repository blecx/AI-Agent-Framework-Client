/**
 * API Client for AI-Agent-Framework project management
 * Handles all API calls for projects, proposals, and workflow operations
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';

// Types
export interface Project {
  key: string;
  name: string;
  status: string;
  documents?: Document[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  path: string;
  content: string;
  type?: string;
}

export interface Proposal {
  id: string;
  projectKey: string;
  changes: Change[];
  status: 'pending' | 'applied' | 'rejected';
  createdAt: string;
}

export interface Change {
  path: string;
  operation: 'create' | 'update' | 'delete';
  content?: string;
  diff?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add API key to requests if available
    if (this.apiKey) {
      this.client.defaults.headers.common['X-API-Key'] = this.apiKey;
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors and return user-friendly messages
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as { message?: string; code?: string } | undefined;
      return {
        message: responseData?.message || error.message || 'An error occurred',
        status: error.response.status,
        code: responseData?.code,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Unable to connect to API server. Please check your connection.',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Update API configuration
   */
  configure(baseUrl?: string, apiKey?: string): void {
    if (baseUrl) {
      this.baseUrl = baseUrl;
      this.client.defaults.baseURL = baseUrl;
    }
    if (apiKey !== undefined) {
      this.apiKey = apiKey;
      if (apiKey) {
        this.client.defaults.headers.common['X-API-Key'] = apiKey;
      } else {
        delete this.client.defaults.headers.common['X-API-Key'];
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): { baseUrl: string; hasApiKey: boolean } {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
    };
  }

  // ==================== Project Management ====================

  /**
   * Fetch all projects
   * GET /projects
   */
  async fetchProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[]>('/projects');
    return response.data;
  }

  /**
   * Create a new project
   * POST /projects
   */
  async createProject(data: {
    name: string;
    key?: string;
    description?: string;
  }): Promise<Project> {
    const response = await this.client.post<Project>('/projects', data);
    return response.data;
  }

  /**
   * Get a specific project by key
   * GET /projects/{key}
   */
  async getProject(key: string): Promise<Project> {
    const response = await this.client.get<Project>(`/projects/${key}`);
    return response.data;
  }

  /**
   * Update a project
   * PUT /projects/{key}
   */
  async updateProject(key: string, data: Partial<Project>): Promise<Project> {
    const response = await this.client.put<Project>(`/projects/${key}`, data);
    return response.data;
  }

  /**
   * Delete a project
   * DELETE /projects/{key}
   */
  async deleteProject(key: string): Promise<void> {
    await this.client.delete(`/projects/${key}`);
  }

  // ==================== Proposal Management ====================

  /**
   * Propose changes to a project
   * POST /projects/{key}/propose
   */
  async proposeChanges(
    projectKey: string,
    changes: {
      description?: string;
      changes: Change[];
    }
  ): Promise<Proposal> {
    const response = await this.client.post<Proposal>(
      `/projects/${projectKey}/propose`,
      changes
    );
    return response.data;
  }

  /**
   * Get all proposals for a project
   * GET /projects/{key}/proposals
   */
  async getProposals(projectKey: string): Promise<Proposal[]> {
    const response = await this.client.get<Proposal[]>(
      `/projects/${projectKey}/proposals`
    );
    return response.data;
  }

  /**
   * Get a specific proposal
   * GET /projects/{key}/proposals/{proposalId}
   */
  async getProposal(projectKey: string, proposalId: string): Promise<Proposal> {
    const response = await this.client.get<Proposal>(
      `/projects/${projectKey}/proposals/${proposalId}`
    );
    return response.data;
  }

  /**
   * Apply a proposal to a project
   * POST /projects/{key}/apply/{proposalId}
   */
  async applyProposal(projectKey: string, proposalId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>(
      `/projects/${projectKey}/apply/${proposalId}`
    );
    return response.data;
  }

  /**
   * Reject a proposal
   * POST /projects/{key}/proposals/{proposalId}/reject
   */
  async rejectProposal(projectKey: string, proposalId: string): Promise<void> {
    await this.client.post(`/projects/${projectKey}/proposals/${proposalId}/reject`);
  }

  // ==================== Health & Status ====================

  /**
   * Check API health
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; timestamp?: string }> {
    const response = await this.client.get<{ status: string; timestamp?: string }>('/health');
    return response.data;
  }

  /**
   * Get API information
   * GET /info
   */
  async getInfo(): Promise<{ version: string; name: string }> {
    const response = await this.client.get<{ version: string; name: string }>('/info');
    return response.data;
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
