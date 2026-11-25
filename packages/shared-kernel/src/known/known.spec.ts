import { describe, expect, it } from 'vitest';

import { declaredOrUnknown, isKnown, isUnknown, known, UNKNOWN } from './known';

describe('Known / Unknown', () => {
  it('wraps a value with its origin', () => {
    const year = known(1998, 'declared');
    expect(year).toEqual({ kind: 'known', value: 1998, origin: 'declared' });
    expect(isKnown(year)).toBe(true);
    expect(isUnknown(year)).toBe(false);
  });

  it('models an unknown year as Unknown, never 0 or empty (HR-F002-AC2)', () => {
    const year = UNKNOWN;
    expect(isUnknown(year)).toBe(true);
    expect(isKnown(year)).toBe(false);
    expect(year).toEqual({ kind: 'unknown' });
    expect(year).not.toBe(0);
    expect(year).not.toBe('');
  });

  it('keeps a known zero distinct from Unknown', () => {
    expect(isKnown(known(0, 'declared'))).toBe(true);
  });

  it.each(['declared', 'calculated', 'inferred'] as const)('accepts origin %s', (origin) => {
    expect(known('x', origin).origin).toBe(origin);
  });
});

describe('declaredOrUnknown', () => {
  it('wraps a present value as declared', () => {
    expect(declaredOrUnknown(3, (v) => v * 2)).toEqual(known(6, 'declared'));
  });

  it('is unknown when the value is absent', () => {
    expect(declaredOrUnknown(undefined, (v: number) => v)).toBe(UNKNOWN);
  });
});
