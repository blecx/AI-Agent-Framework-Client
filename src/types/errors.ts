/**
 * Custom Error Types with Discriminated Unions
 * Provides type-safe error handling across the application
 */

/**
 * Base error interface - all custom errors extend this
 */
interface BaseError {
  message: string;
  timestamp: string;
  cause?: Error;
}

/**
 * Network-related errors (connection failures, timeouts)
 */
export interface NetworkError extends BaseError {
  type: 'network';
  code?: string;
  isRetryable: boolean;
}

/**
 * Validation errors (Zod validation failures, invalid data)
 */
export interface ValidationError extends BaseError {
  type: 'validation';
  field?: string;
  details?: unknown;
}

/**
 * API errors (4xx, 5xx responses from server)
 */
export interface ApiError extends BaseError {
  type: 'api';
  status: number;
  detail?: string;
}

/**
 * Discriminated union of all error types
 */
export type AppError = NetworkError | ValidationError | ApiError;

/**
 * Type guard: check if error is NetworkError
 */
export function isNetworkError(error: AppError): error is NetworkError {
  return error.type === 'network';
}

/**
 * Type guard: check if error is ValidationError
 */
export function isValidationError(error: AppError): error is ValidationError {
  return error.type === 'validation';
}

/**
 * Type guard: check if error is ApiError
 */
export function isApiError(error: AppError): error is ApiError {
  return error.type === 'api';
}

/**
 * Factory: create NetworkError
 */
export function createNetworkError(
  message: string,
  isRetryable: boolean = true,
  code?: string,
  cause?: Error,
): NetworkError {
  return {
    type: 'network',
    message,
    isRetryable,
    code,
    timestamp: new Date().toISOString(),
    cause,
  };
}

/**
 * Factory: create ValidationError
 */
export function createValidationError(
  message: string,
  field?: string,
  details?: unknown,
  cause?: Error,
): ValidationError {
  return {
    type: 'validation',
    message,
    field,
    details,
    timestamp: new Date().toISOString(),
    cause,
  };
}

/**
 * Factory: create ApiError
 */
export function createApiError(
  message: string,
  status: number,
  detail?: string,
  cause?: Error,
): ApiError {
  return {
    type: 'api',
    message,
    status,
    detail,
    timestamp: new Date().toISOString(),
    cause,
  };
}
