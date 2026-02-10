/**
 * Custom Error Classes for API Clients
 * Provides discriminated union types for better error handling
 */

export type ApiErrorType = 'network' | 'validation' | 'authentication' | 'not_found' | 'server' | 'unknown';

export interface ApiErrorDetails {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  originalError?: unknown;
  retryable: boolean;
}

/**
 * Base class for all API errors
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;
  public readonly retryable: boolean;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiError';
    this.type = details.type;
    this.statusCode = details.statusCode;
    this.originalError = details.originalError;
    this.retryable = details.retryable;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
    };
  }
}

/**
 * Network-related errors (connection failures, timeouts)
 */
export class NetworkError extends ApiError {
  constructor(message: string, originalError?: unknown) {
    super({
      type: 'network',
      message,
      originalError,
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors (invalid request/response data)
 */
export class ValidationError extends ApiError {
  public readonly validationErrors?: unknown;

  constructor(message: string, validationErrors?: unknown) {
    super({
      type: 'validation',
      message,
      retryable: false,
    });
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Authentication errors (401, missing/invalid API key)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string, statusCode = 401) {
    super({
      type: 'authentication',
      message,
      statusCode,
      retryable: false,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends ApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message: string, resourceType?: string, resourceId?: string) {
    super({
      type: 'not_found',
      message,
      statusCode: 404,
      retryable: false,
    });
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Server errors (5xx)
 */
export class ServerError extends ApiError {
  constructor(message: string, statusCode: number, originalError?: unknown) {
    super({
      type: 'server',
      message,
      statusCode,
      originalError,
      retryable: true, // 5xx errors are generally retryable
    });
    this.name = 'ServerError';
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return isApiError(error) && error.retryable;
}
