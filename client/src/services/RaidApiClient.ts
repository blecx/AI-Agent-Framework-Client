import axios, { type AxiosError, type AxiosInstance, isAxiosError } from 'axios';
import type {
  RAIDItem,
  RAIDItemCreate,
  RAIDItemList,
  RAIDItemUpdate,
  RAIDPriority,
  RAIDStatus,
  RAIDType,
} from '../types';
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  ServerError,
} from './errors';

export type RaidListFilters = {
  type?: RAIDType;
  status?: RAIDStatus;
  owner?: string;
  priority?: RAIDPriority;
};

export class RaidApiClient {
  private client: AxiosInstance;

  constructor(baseUrl?: string, apiKey?: string) {
    const apiBaseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      timeout: 30000,
    });
  }

  private handleError(error: unknown): never {
    if (!isAxiosError(error)) {
      throw new ApiError({
        type: 'unknown',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        retryable: false,
        originalError: error,
      });
    }

    const axiosError = error as AxiosError;

    if (!axiosError.response) {
      throw new NetworkError(
        'Network error: Could not connect to server. Please check your connection.',
        axiosError,
      );
    }

    const status = axiosError.response.status;
    const responseData = axiosError.response.data as
      | { message?: string; detail?: string }
      | undefined;
    const message = responseData?.detail || responseData?.message || `API Error: ${status}`;

    if (status === 401) {
      throw new AuthenticationError(message, status);
    }

    if (status === 404) {
      throw new NotFoundError(message, 'raid_item');
    }

    if (status >= 500) {
      throw new ServerError(message, status, axiosError);
    }

    throw new ApiError({
      type: 'unknown',
      message,
      statusCode: status,
      retryable: false,
      originalError: axiosError,
    });
  }

  async listRAIDItems(
    projectKey: string,
    filters?: RaidListFilters,
  ): Promise<RAIDItemList> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.owner) params.append('owner', filters.owner);
      if (filters?.priority) params.append('priority', filters.priority);

      const queryString = params.toString();
      const url = `/projects/${projectKey}/raid${queryString ? `?${queryString}` : ''}`;
      const response = await this.client.get<RAIDItemList>(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRAIDItem(projectKey: string, raidId: string): Promise<RAIDItem> {
    try {
      const response = await this.client.get<RAIDItem>(
        `/projects/${projectKey}/raid/${raidId}`,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createRAIDItem(projectKey: string, data: RAIDItemCreate): Promise<RAIDItem> {
    try {
      const response = await this.client.post<RAIDItem>(`/projects/${projectKey}/raid`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateRAIDItem(
    projectKey: string,
    raidId: string,
    data: RAIDItemUpdate,
  ): Promise<RAIDItem> {
    try {
      const response = await this.client.put<RAIDItem>(
        `/projects/${projectKey}/raid/${raidId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteRAIDItem(projectKey: string, raidId: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(
        `/projects/${projectKey}/raid/${raidId}`,
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const raidApiClient = new RaidApiClient();