import { describe, expect, it } from 'vitest';

import {
  RAIDImpactLevel,
  RAIDLikelihood,
  RAIDPriority,
  RAIDStatus,
  RAIDType,
} from '../../../types/raid';

describe('RAID types', () => {
  it('exposes expected string literal values', () => {
    expect(RAIDType.RISK).toBe('risk');
    expect(RAIDType.ASSUMPTION).toBe('assumption');
    expect(RAIDType.ISSUE).toBe('issue');
    expect(RAIDType.DEPENDENCY).toBe('dependency');

    expect(RAIDStatus.OPEN).toBe('open');
    expect(RAIDStatus.IN_PROGRESS).toBe('in_progress');
    expect(RAIDStatus.MITIGATED).toBe('mitigated');
    expect(RAIDStatus.CLOSED).toBe('closed');
    expect(RAIDStatus.ACCEPTED).toBe('accepted');

    expect(RAIDPriority.CRITICAL).toBe('critical');
    expect(RAIDPriority.HIGH).toBe('high');
    expect(RAIDPriority.MEDIUM).toBe('medium');
    expect(RAIDPriority.LOW).toBe('low');

    expect(RAIDImpactLevel.VERY_HIGH).toBe('very_high');
    expect(RAIDImpactLevel.HIGH).toBe('high');
    expect(RAIDImpactLevel.MEDIUM).toBe('medium');
    expect(RAIDImpactLevel.LOW).toBe('low');
    expect(RAIDImpactLevel.VERY_LOW).toBe('very_low');

    expect(RAIDLikelihood.VERY_LIKELY).toBe('very_likely');
    expect(RAIDLikelihood.LIKELY).toBe('likely');
    expect(RAIDLikelihood.POSSIBLE).toBe('possible');
    expect(RAIDLikelihood.UNLIKELY).toBe('unlikely');
    expect(RAIDLikelihood.VERY_UNLIKELY).toBe('very_unlikely');
  });
});
