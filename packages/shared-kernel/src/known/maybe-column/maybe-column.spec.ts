import { describe, expect, it } from 'vitest';

import { known, UNKNOWN } from '../known';
import { fromColumn, type OriginsRecord, toColumn } from './maybe-column';

describe('maybe columns', () => {
  it('should store a known value and record its origin', () => {
    const origins: OriginsRecord = {};

    const column = toColumn({ kind: 'known', value: 3, origin: 'inferred' }, 'bedrooms', origins);

    expect(column).toBe(3);
    expect(origins).toEqual({ bedrooms: 'inferred' });
  });

  it('should store an unknown value as null and record no origin', () => {
    const origins: OriginsRecord = {};

    expect(toColumn({ kind: 'unknown' }, 'bedrooms', origins)).toBeNull();
    expect(origins).toEqual({});
  });

  it('should rebuild a known value with its recorded origin', () => {
    expect(fromColumn(3, 'bedrooms', { bedrooms: 'calculated' }, (v) => v * 2)).toEqual(known(6, 'calculated'));
  });

  it('should rebuild a null column as unknown', () => {
    expect(fromColumn(null, 'bedrooms', {}, (v: number) => v)).toBe(UNKNOWN);
  });

  it('should default the origin to declared when none was recorded', () => {
    expect(fromColumn(true, 'garage', {}, (v) => v)).toEqual(known(true, 'declared'));
  });
});
