/**
 * API Client for AI Agent Framework
 * Provides methods for project management, proposals, and commands
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  Project, 
  Proposal, 
  Command, 
  ApiResponse 
} from '../types';

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const responseData = error.response.data as { message?: string } | undefined;
          throw new Error(
            responseData?.message || 
            `API Error: ${error.response.status}`
          );
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from server. Please check if the API is running.');
        } else {
          // Error in request setup
          throw new Error(error.message || 'Request failed');
        }
      }
    );
  }

  /**
   * Update the base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
  }

  /**
   * Update the API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${key}`;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // ==================== Project Management ====================

  /**
   * List all projects
   */
  async listProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await this.client.get<Project[]>('/projects');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list projects',
      };
    }
  }

  /**
   * Get a specific project by key
   */
  async getProject(key: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.get<Project>(`/projects/${key}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project',
      };
    }
  }

  /**
   * Create a new project
   */
  async createProject(key: string, name: string, description?: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.post<Project>('/projects', {
        key,
        name,
        description,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  /**
   * Update a project
   */
  async updateProject(key: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.put<Project>(`/projects/${key}`, updates);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project',
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(key: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`/projects/${key}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project',
      };
    }
  }

  // ==================== Proposal Management ====================

  /**
   * Propose changes to a project
   */
  async propose(projectKey: string, changes: object): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals`,
        changes
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal',
      };
    }
  }

  /**
   * Get all proposals for a project
   */
  async getProposals(projectKey: string): Promise<ApiResponse<Proposal[]>> {
    try {
      const response = await this.client.get<Proposal[]>(
        `/projects/${projectKey}/proposals`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get proposals',
      };
    }
  }

  /**
   * Get a specific proposal
   */
  async getProposal(projectKey: string, proposalId: string): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.get<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get proposal',
      };
    }
  }

  /**
   * Apply a proposal to the project
   */
  async applyProposal(projectKey: string, proposalId: string): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}/apply`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply proposal',
      };
    }
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(projectKey: string, proposalId: string): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}/reject`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject proposal',
      };
    }
  }

  // ==================== Command Execution ====================

  /**
   * Execute a command
   */
  async executeCommand(
    command: string,
    projectKey?: string,
    args?: string[]
  ): Promise<ApiResponse<Command>> {
    try {
      const response = await this.client.post<Command>('/commands', {
        command,
        projectKey,
        args,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute command',
      };
    }
  }

  /**
   * Get command status
   */
  async getCommand(commandId: string): Promise<ApiResponse<Command>> {
    try {
      const response = await this.client.get<Command>(`/commands/${commandId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get command',
      };
    }
  }

  /**
   * Get command history
   */
  async getCommandHistory(projectKey?: string): Promise<ApiResponse<Command[]>> {
    try {
      const url = projectKey 
        ? `/commands?projectKey=${projectKey}` 
        : '/commands';
      const response = await this.client.get<Command[]>(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get command history',
      };
    }
  }

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
export const apiClient = new ApiClient();
export default apiClient;
