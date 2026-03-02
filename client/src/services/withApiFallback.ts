/**
 * withApiFallback — S3R-UX-03
 *
 * Wraps an API call so that any ApiError is caught and replaced with a
 * deterministic fallback value, ensuring consistent error display on failure.
 *
 * Design goals:
 * - Deterministic: always returns `fallback` (never throws) when the API fails
 * - Consistent messaging: delegates error reporting to the optional `onError`
 *   callback so the UI layer controls how messages are shown
 * - Scope-limited: does not retry internally; callers that need retries should
 *   use the retry-aware `ProjectApiClient.withRetry` instead
 */

import { ApiError, isApiError } from './errors';

export interface FallbackResult<T> {
  data: T;
  error: ApiError | null;
}

/**
 * Execute `fn` and return its result.  If `fn` throws an {@link ApiError},
 * return `fallback` instead and pass the error to `onError`.
 *
 * Non-ApiError exceptions are re-thrown unchanged (they indicate programming
 * errors, not expected API failures).
 *
 * @param fn        Async API call to execute
 * @param fallback  Value to return when the API call fails
 * @param onError   Optional callback receiving the caught ApiError
 * @returns         `{ data, error }` — error is null on success
 */
export async function withApiFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (err: ApiError) => void,
): Promise<FallbackResult<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    if (isApiError(err)) {
      onError?.(err);
      return { data: fallback, error: err };
    }
    // Re-throw non-API errors (programming errors, not network/server errors)
    throw err;
  }
}

/**
 * Build a deterministic user-facing error message from an ApiError.
 *
 * Message content is consistent across repeated calls with the same error:
 * same type + same message → same output string, every time.
 */
export function buildFallbackMessage(err: ApiError): string {
  switch (err.type) {
    case 'network':
      return 'Unable to reach the server. Please check your connection.';
    case 'not_found':
      return 'The requested resource was not found.';
    case 'authentication':
      return 'Authentication failed. Please log in again.';
    case 'validation':
      return `Invalid request: ${err.message}`;
    case 'server':
      return 'A server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
