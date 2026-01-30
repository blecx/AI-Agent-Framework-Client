/**
 * API Client for AI Agent Framework
 * Provides methods for project management, proposals, commands, and RAID
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Project,
  Proposal,
  Command,
  ApiResponse,
  RAIDItem,
  RAIDItemCreate,
  RAIDItemUpdate,
  RAIDItemList,
  RAIDType,
  RAIDStatus,
  RAIDPriority,
} from '../types';
import { notify } from '../notifications/notificationBus';

type ApiClientRequestConfig = AxiosRequestConfig & {
  suppressErrorToast?: boolean;
};

type NotifyFn = typeof notify;

export function formatApiErrorMessage(error: AxiosError): string {
  if (error.response) {
    const responseData = error.response.data as
      | { message?: string; detail?: string }
      | undefined;

    return (
      responseData?.detail ||
      responseData?.message ||
      `API Error: ${error.response.status}`
    );
  }

  if (error.request) {
    return 'No response from server. Please check if the API is running.';
  }

  return error.message || 'Request failed';
}

export function handleApiClientAxiosError(
  error: AxiosError,
  notifyFn: NotifyFn = notify,
): never {
  const cfg = (error.config || {}) as ApiClientRequestConfig;
  const message = formatApiErrorMessage(error);

  if (!cfg.suppressErrorToast) {
    notifyFn({ type: 'error', message, duration: 5000 });
  }

  throw new Error(message);
}

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
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        handleApiClientAxiosError(error);
      },
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
        error:
          error instanceof Error ? error.message : 'Failed to list projects',
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
  async createProject(
    key: string,
    name: string,
    description?: string,
  ): Promise<ApiResponse<Project>> {
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
        error:
          error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    key: string,
    updates: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await this.client.put<Project>(
        `/projects/${key}`,
        updates,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update project',
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
        error:
          error instanceof Error ? error.message : 'Failed to delete project',
      };
    }
  }

  // ==================== Proposal Management ====================

  /**
   * Propose changes to a project
   */
  async propose(
    projectKey: string,
    changes: object,
  ): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals`,
        changes,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create proposal',
      };
    }
  }

  /**
   * Get all proposals for a project
   */
  async getProposals(projectKey: string): Promise<ApiResponse<Proposal[]>> {
    try {
      const response = await this.client.get<Proposal[]>(
        `/projects/${projectKey}/proposals`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get proposals',
      };
    }
  }

  /**
   * Get a specific proposal
   */
  async getProposal(
    projectKey: string,
    proposalId: string,
  ): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.get<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get proposal',
      };
    }
  }

  /**
   * Apply a proposal to the project
   */
  async applyProposal(
    projectKey: string,
    proposalId: string,
  ): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}/apply`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to apply proposal',
      };
    }
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(
    projectKey: string,
    proposalId: string,
  ): Promise<ApiResponse<Proposal>> {
    try {
      const response = await this.client.post<Proposal>(
        `/projects/${projectKey}/proposals/${proposalId}/reject`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to reject proposal',
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
    args?: string[],
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
        error:
          error instanceof Error ? error.message : 'Failed to execute command',
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
  async getCommandHistory(
    projectKey?: string,
  ): Promise<ApiResponse<Command[]>> {
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get command history',
      };
    }
  }

  /**
   * Check API health
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; timestamp?: string }> {
    const suppressToastConfig: ApiClientRequestConfig = {
      suppressErrorToast: true,
    };

    const response = await this.client.get<{
      status: string;
      timestamp?: string;
    }>('/health', suppressToastConfig);
    return response.data;
  }

  /**
   * Get API information
   * GET /info
   */
  async getInfo(): Promise<{ version: string; name: string }> {
    const suppressToastConfig: ApiClientRequestConfig = {
      suppressErrorToast: true,
    };

    const response = await this.client.get<{ version: string; name: string }>(
      '/info',
      suppressToastConfig,
    );
    return response.data;
  }

  // ============================================================================
  // RAID Register Endpoints
  // ============================================================================

  /**
   * List RAID items for a project with optional filters
   * GET /projects/:projectKey/raid
   */
  async listRAIDItems(
    projectKey: string,
    filters?: {
      type?: RAIDType;
      status?: RAIDStatus;
      owner?: string;
      priority?: RAIDPriority;
    },
  ): Promise<ApiResponse<RAIDItemList>> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.owner) params.append('owner', filters.owner);
      if (filters?.priority) params.append('priority', filters.priority);

      const queryString = params.toString();
      const url = `/projects/${projectKey}/raid${queryString ? `?${queryString}` : ''}`;

      const response = await this.client.get<RAIDItemList>(url);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to list RAID items',
      };
    }
  }

  /**
   * Get a specific RAID item
   * GET /projects/:projectKey/raid/:raidId
   */
  async getRAIDItem(
    projectKey: string,
    raidId: string,
  ): Promise<ApiResponse<RAIDItem>> {
    try {
      const response = await this.client.get<RAIDItem>(
        `/projects/${projectKey}/raid/${raidId}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get RAID item',
      };
    }
  }

  /**
   * Create a new RAID item
   * POST /projects/:projectKey/raid
   */
  async createRAIDItem(
    projectKey: string,
    data: RAIDItemCreate,
  ): Promise<ApiResponse<RAIDItem>> {
    try {
      const response = await this.client.post<RAIDItem>(
        `/projects/${projectKey}/raid`,
        data,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create RAID item',
      };
    }
  }

  /**
   * Update an existing RAID item
   * PUT /projects/:projectKey/raid/:raidId
   */
  async updateRAIDItem(
    projectKey: string,
    raidId: string,
    data: RAIDItemUpdate,
  ): Promise<ApiResponse<RAIDItem>> {
    try {
      const response = await this.client.put<RAIDItem>(
        `/projects/${projectKey}/raid/${raidId}`,
        data,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update RAID item',
      };
    }
  }

  /**
   * Delete a RAID item
   * DELETE /projects/:projectKey/raid/:raidId
   */
  async deleteRAIDItem(
    projectKey: string,
    raidId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.client.delete<{ message: string }>(
        `/projects/${projectKey}/raid/${raidId}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete RAID item',
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
