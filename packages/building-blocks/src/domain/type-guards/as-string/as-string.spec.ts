import { describe, expect, it } from 'vitest';

import { asString } from './as-string';

describe('asString', () => {
  it('should return a string as it is, including the empty string', () => {
    expect(asString('Piso')).toBe('Piso');
    expect(asString('')).toBe('');
  });

  it('should return null for anything that is not a string', () => {
    expect(asString(1)).toBeNull();
    expect(asString(true)).toBeNull();
    expect(asString(undefined)).toBeNull();
    expect(asString(null)).toBeNull();
  });
});
