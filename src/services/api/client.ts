/**
 * API Client - Axios-based HTTP client with interceptors and retry logic
 * Provides centralized configuration for all API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiError } from '../../types/api';

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
   * Convert Axios error to ApiError
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail: string }>;

      return {
        detail:
          axiosError.response?.data?.detail ||
          axiosError.message ||
          'An unknown error occurred',
        status: axiosError.response?.status,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      detail:
        error instanceof Error ? error.message : 'An unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
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
