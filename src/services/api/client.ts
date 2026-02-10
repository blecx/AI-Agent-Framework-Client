/**
 * API Client - Axios-based HTTP client with interceptors and retry logic
 * Provides centralized configuration for all API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { z } from 'zod';
import {
  AppError,
  createNetworkError,
  createValidationError,
  createApiError,
} from '../../types/errors';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  apiKey?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private retryCount: Map<string, number>;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };

    this.retryCount = new Map();

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth header if API key provided
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.apiKey && config.headers) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      },
    );

    // Response interceptor - handle errors and retry logic
    this.client.interceptors.response.use(
      (response) => {
        // Clear retry count on success
        const requestId = this.getRequestId(response.config);
        this.retryCount.delete(requestId);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      },
    );
  }

  /**
   * Handle response errors with retry logic
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    const config = error.config as AxiosRequestConfig;

    if (!config) {
      return Promise.reject(this.handleError(error));
    }

    const requestId = this.getRequestId(config);
    const currentRetry = this.retryCount.get(requestId) || 0;

    // Retry on network errors or 5xx server errors
    const shouldRetry =
      (!error.response ||
        (error.response.status >= 500 && error.response.status < 600)) &&
      currentRetry < (this.config.maxRetries || 3);

    if (shouldRetry) {
      this.retryCount.set(requestId, currentRetry + 1);

      // Exponential backoff
      const delay =
        (this.config.retryDelay || 1000) * Math.pow(2, currentRetry);
      await this.sleep(delay);

      return this.client.request(config);
    }

    // Max retries exceeded or non-retryable error
    this.retryCount.delete(requestId);
    return Promise.reject(this.handleError(error));
  }

  /**
   * Generate unique request ID for retry tracking
   */
  private getRequestId(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
  }

  /**
   * Sleep utility for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convert Axios error to AppError with discriminated union types
   */
  private handleError(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;

      // Network errors (no response received)
      if (!axiosError.response) {
        const isTimeout = axiosError.code === 'ECONNABORTED';
        return createNetworkError(
          axiosError.message || 'Network error occurred',
          !isTimeout, // timeouts are not retryable
          axiosError.code,
          axiosError,
        );
      }

      // API errors (got response from server)
      const status = axiosError.response.status;
      const detail = axiosError.response.data?.detail;

      return createApiError(
        detail || axiosError.message || 'API error occurred',
        status,
        detail,
        axiosError,
      );
    }

    // Unknown error type
    return createNetworkError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      false,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  /**
   * Validate response data with Zod schema
   */
  private validateResponse<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createValidationError(
          'Response validation failed',
          undefined,
          error.issues,
          error,
        );
      }
      throw createValidationError(
        'Unknown validation error',
        undefined,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * GET request with Zod validation
   */
  async getValidated<T>(
    url: string,
    schema: z.ZodSchema<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return this.validateResponse(response.data, schema);
  }

  /**
   * POST request
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * POST request with Zod validation
   */
  async postValidated<T, D = unknown>(
    url: string,
    data: D,
    schema: z.ZodSchema<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return this.validateResponse(response.data, schema);
  }

  /**
   * PUT request
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string | undefined): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }
}
