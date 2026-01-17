import { describe, expect, it } from 'vitest';

import {
  assertHealthy,
  assertJsonArray,
  normalizeBaseUrl,
  rootFromBase,
} from '../scripts/api-smoke.mjs';

describe('api smoke helpers', () => {
  it('normalizeBaseUrl trims and strips trailing slashes', () => {
    expect(normalizeBaseUrl(' http://localhost:8000/ ')).toBe(
      'http://localhost:8000',
    );
    expect(normalizeBaseUrl('http://localhost:8000///')).toBe(
      'http://localhost:8000',
    );
  });

  it('rootFromBase removes /api/v1 suffix', () => {
    expect(rootFromBase('http://localhost:8000/api/v1')).toBe(
      'http://localhost:8000',
    );
    expect(rootFromBase('http://localhost:8000')).toBe('http://localhost:8000');
  });

  it('assertHealthy accepts healthy payload', () => {
    expect(() => assertHealthy({ status: 'healthy' }, 'u')).not.toThrow();
  });

  it('assertHealthy rejects unhealthy payload', () => {
    expect(() => assertHealthy({ status: 'nope' } as any, 'u')).toThrow(
      /healthy/,
    );
  });

  it('assertJsonArray accepts arrays and rejects non-arrays', () => {
    expect(() => assertJsonArray([], 'u')).not.toThrow();
    expect(() => assertJsonArray({} as any, 'u')).toThrow(/JSON array/);
  });
});
