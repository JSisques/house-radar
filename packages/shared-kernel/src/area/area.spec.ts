import { describe, expect, it } from 'vitest';

import { Area } from './area';
import { InvalidAreaException } from './invalid-area.exception';

describe('Area', () => {
  it('stores square meters', () => {
    const area = new Area(100);
    expect(area.squareMeters).toBe(100);
    expect(area.toPrimitives()).toBe(100);
    expect(new Area(87.5).squareMeters).toBe(87.5);
  });

  it('compares by value', () => {
    expect(new Area(100).equals(new Area(100))).toBe(true);
    expect(new Area(100).equals(new Area(105))).toBe(false);
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (value) => {
    expect(() => new Area(value)).toThrow(InvalidAreaException);
  });
});
