/**
 * Project API Client
 * Domain-specific client for project operations (SRP compliance)
 * Provides type-safe methods with validation, error handling, and retry logic
 */

import axios, { type AxiosInstance, type AxiosError, isAxiosError } from 'axios';
import {
  type Project,
  type CreateProjectRequest,
  type UpdateProjectRequest,
  validateProject,
  validateProjectList,
  validateCreateProjectRequest,
  validateUpdateProjectRequest,
} from '../types/project';
import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ServerError,
  isRetryableError,
} from './errors';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

export class ProjectApiClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(baseUrl?: string, apiKey?: string, retryConfig?: Partial<RetryConfig>) {
    const apiBaseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      timeout: 30000,
    });

    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Handle and transform Axios errors into custom ApiError types
   */
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

    // Network errors (no response received)
    if (!axiosError.response) {
      throw new NetworkError(
        'Network error: Could not connect to server. Please check your connection.',
        axiosError
      );
    }

    const status = axiosError.response.status;
    const responseData = axiosError.response.data as { message?: string; detail?: string } | undefined;
    const message = responseData?.detail || responseData?.message || `API Error: ${status}`;

    // 401 Authentication errors
    if (status === 401) {
      throw new AuthenticationError(message, status);
    }

    // 404 Not found errors
    if (status === 404) {
      throw new NotFoundError(message, 'project');
    }

    // 5xx Server errors
    if (status >= 500) {
      throw new ServerError(message, status, axiosError);
    }

    // Generic API error for other cases
    throw new ApiError({
      type: 'unknown',
      message,
      statusCode: status,
      retryable: false,
      originalError: axiosError,
    });
  }

  /**
   * Execute request with exponential backoff retry logic
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if not retryable or if this was the last attempt
        if (!isRetryableError(error) || attempt === this.retryConfig.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * List all projects
   * @throws {NetworkError} Network connection failed
   * @throws {ServerError} Server returned 5xx error
   * @throws {ValidationError} Response validation failed
   */
  async listProjects(): Promise<Project[]> {
    return this.withRetry(async () => {
      try {
        const response = await this.client.get<unknown>('/projects');
        return validateProjectList(response.data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        return this.handleError(error);
      }
    });
  }

  /**
   * Get a specific project by key
   * @throws {NotFoundError} Project not found
   * @throws {NetworkError} Network connection failed
   * @throws {ValidationError} Response validation failed
   */
  async getProject(key: string): Promise<Project> {
    return this.withRetry(async () => {
      try {
        const response = await this.client.get<unknown>(`/projects/${key}`);
        return validateProject(response.data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        return this.handleError(error);
      }
    });
  }

  /**
   * Create a new project
   * @throws {ValidationError} Invalid request data or response validation failed
   * @throws {NetworkError} Network connection failed
   */
  async createProject(request: CreateProjectRequest): Promise<Project> {
    return this.withRetry(async () => {
      try {
        // Validate request before sending
        const validatedRequest = validateCreateProjectRequest(request);
        
        const response = await this.client.post<unknown>('/projects', validatedRequest);
        return validateProject(response.data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        return this.handleError(error);
      }
    });
  }

  /**
   * Update an existing project
   * @throws {NotFoundError} Project not found
   * @throws {ValidationError} Invalid request data or response validation failed
   * @throws {NetworkError} Network connection failed
   */
  async updateProject(key: string, updates: UpdateProjectRequest): Promise<Project> {
    return this.withRetry(async () => {
      try {
        // Validate request before sending
        const validatedUpdates = validateUpdateProjectRequest(updates);
        
        const response = await this.client.put<unknown>(`/projects/${key}`, validatedUpdates);
        return validateProject(response.data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        return this.handleError(error);
      }
    });
  }

  /**
   * Delete a project
   * @throws {NotFoundError} Project not found
   * @throws {NetworkError} Network connection failed
   */
  async deleteProject(key: string): Promise<void> {
    return this.withRetry(async () => {
      try {
        await this.client.delete(`/projects/${key}`);
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
}

// Singleton instance for convenience
export const projectApiClient = new ProjectApiClient();
