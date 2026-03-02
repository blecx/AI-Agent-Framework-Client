/**
 * Tests for withApiFallback — S3R-UX-03
 *
 * Covers:
 * - Success path: data returned, no error
 * - ApiError → fallback returned, onError called
 * - Non-retryable ApiError (e.g. 404) → fallback immediately
 * - Retryable ApiError (network error) → fallback
 * - Non-ApiError → re-thrown
 * - buildFallbackMessage: deterministic message for every error type
 *
 * Run: npm test -- --run --reporter=verbose 2>&1 | grep "withApiFallback"
 */

import { describe, it, expect, vi } from 'vitest';
import {
  withApiFallback,
  buildFallbackMessage,
} from '../../../services/withApiFallback';
import {
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
  AuthenticationError,
  ApiError,
} from '../../../services/errors';

// ---------------------------------------------------------------------------
// withApiFallback — fallback + callback behaviour
// ---------------------------------------------------------------------------

describe('withApiFallback — API error fallback consistency (#269)', () => {
  it('returns data and null error on success', async () => {
    const result = await withApiFallback(async () => 'ok', 'fallback');
    expect(result).toEqual({ data: 'ok', error: null });
  });

  it('returns fallback and the ApiError on network failure', async () => {
    const err = new NetworkError('timeout');
    const result = await withApiFallback(async () => {
      throw err;
    }, [] as string[]);
    expect(result.data).toEqual([]);
    expect(result.error).toBe(err);
  });

  it('returns fallback on non-retryable 404 error', async () => {
    const err = new NotFoundError('project not found', 'project', 'DEMO');
    const result = await withApiFallback(async () => {
      throw err;
    }, null);
    expect(result.data).toBeNull();
    expect(result.error?.type).toBe('not_found');
  });

  it('returns fallback on retryable server error', async () => {
    const err = new ServerError('service unavailable', 503);
    const result = await withApiFallback(async () => {
      throw err;
    }, []);
    expect(result.data).toEqual([]);
    expect(result.error?.retryable).toBe(true);
  });

  it('invokes onError callback with the ApiError', async () => {
    const onError = vi.fn();
    const err = new NetworkError('connection refused');
    await withApiFallback(async () => { throw err; }, [], onError);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(err);
  });

  it('does NOT invoke onError on success', async () => {
    const onError = vi.fn();
    await withApiFallback(async () => 42, 0, onError);
    expect(onError).not.toHaveBeenCalled();
  });

  it('re-throws non-ApiError exceptions unchanged', async () => {
    const bug = new TypeError('undefined is not a function');
    await expect(
      withApiFallback(async () => { throw bug; }, null),
    ).rejects.toThrow(TypeError);
  });

  it('result is deterministic across three identical calls', async () => {
    const err = new NetworkError('unstable');
    const fn = async () => { throw err; };
    const r1 = await withApiFallback(fn, 'X');
    const r2 = await withApiFallback(fn, 'X');
    const r3 = await withApiFallback(fn, 'X');
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });
});

// ---------------------------------------------------------------------------
// buildFallbackMessage — deterministic per-type messages
// ---------------------------------------------------------------------------

describe('buildFallbackMessage — consistent user-facing messages', () => {
  it('network error → connection message', () => {
    const msg = buildFallbackMessage(new NetworkError('timeout'));
    expect(msg).toContain('connection');
  });

  it('not_found error → resource not found message', () => {
    const msg = buildFallbackMessage(new NotFoundError('nope'));
    expect(msg).toContain('not found');
  });

  it('authentication error → login message', () => {
    const msg = buildFallbackMessage(new AuthenticationError('401'));
    expect(msg).toContain('log in');
  });

  it('validation error → includes original message', () => {
    const msg = buildFallbackMessage(new ValidationError('missing key'));
    expect(msg).toContain('missing key');
  });

  it('server error → try again later message', () => {
    const msg = buildFallbackMessage(new ServerError('503', 503));
    expect(msg).toContain('try again later');
  });

  it('unknown type → generic fallback message', () => {
    const err = new ApiError({ type: 'unknown', message: 'mystery', retryable: false });
    const msg = buildFallbackMessage(err);
    expect(msg).toContain('unexpected');
  });

  it('same error input produces same message across 3 calls', () => {
    const err = new NetworkError('ping failed');
    const m1 = buildFallbackMessage(err);
    const m2 = buildFallbackMessage(err);
    const m3 = buildFallbackMessage(err);
    expect(m1).toBe(m2);
    expect(m2).toBe(m3);
  });
});
