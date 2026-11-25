import { describe, expect, it } from 'vitest';

import { InvalidLocationPrecisionException } from './invalid-location-precision.exception';
import { LocationPrecision } from './location-precision';

describe('LocationPrecision', () => {
  it.each(['exact', 'approximate', 'municipality'])('accepts %s', (value) => {
    expect(new LocationPrecision(value).toPrimitives()).toBe(value);
  });

  it('rejects an unknown precision', () => {
    expect(() => new LocationPrecision('street')).toThrow(InvalidLocationPrecisionException);
  });
});
