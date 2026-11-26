import { describe, expect, it } from 'vitest';

import { asNumber } from './as-number';

describe('asNumber', () => {
  it('should return a number as it is, including zero', () => {
    expect(asNumber(105)).toBe(105);
    expect(asNumber(0)).toBe(0);
  });

  it('should return null for anything that is not a number', () => {
    expect(asNumber('1')).toBeNull();
    expect(asNumber(true)).toBeNull();
    expect(asNumber(undefined)).toBeNull();
    expect(asNumber(null)).toBeNull();
  });
});
