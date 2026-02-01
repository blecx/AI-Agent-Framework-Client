/**
 * useRetry Hook
 * Provides retry logic with exponential backoff for failed operations
 */

import { useState, useCallback } from 'react';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
  });

  const calculateDelay = (attempt: number): number => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  };

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setState({ attempt, isRetrying: attempt > 0, lastError: null });
          const result = await operation();
          setState({ attempt: 0, isRetrying: false, lastError: null });
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          setState({ attempt, isRetrying: true, lastError });

          // Don't retry on last attempt
          if (attempt < maxAttempts - 1) {
            const delay = calculateDelay(attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      setState({ attempt: 0, isRetrying: false, lastError });
      throw lastError || new Error('Operation failed after retries');
    },
    [maxAttempts, initialDelay, maxDelay, backoffFactor]
  );

  const reset = useCallback(() => {
    setState({ attempt: 0, isRetrying: false, lastError: null });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state,
  };
}
