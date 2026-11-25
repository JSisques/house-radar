import { describe, expect, it } from 'vitest';

import { GeoPoint } from './geo-point';
import { InvalidGeoPointException } from './invalid-geo-point.exception';

describe('GeoPoint', () => {
  it('stores latitude and longitude', () => {
    const point = new GeoPoint(40.4168, -3.7038);
    expect(point.latitude).toBe(40.4168);
    expect(point.longitude).toBe(-3.7038);
  });

  it('serializes to latitude and longitude', () => {
    expect(new GeoPoint(40.4, -3.7).toPrimitives()).toEqual({ latitude: 40.4, longitude: -3.7 });
  });

  it('compares by value', () => {
    expect(new GeoPoint(40.4, -3.7).equals(new GeoPoint(40.4, -3.7))).toBe(true);
    expect(new GeoPoint(40.4, -3.7).equals(new GeoPoint(40.4, -3.8))).toBe(false);
  });

  it('accepts the coordinate bounds', () => {
    expect(() => new GeoPoint(90, 180)).not.toThrow();
    expect(() => new GeoPoint(-90, -180)).not.toThrow();
  });

  it.each([
    [90.1, 0],
    [-90.1, 0],
    [0, 180.1],
    [0, -180.1],
    [Number.NaN, 0],
    [0, Number.POSITIVE_INFINITY],
  ])('rejects (%s, %s)', (latitude, longitude) => {
    expect(() => new GeoPoint(latitude, longitude)).toThrow(InvalidGeoPointException);
  });
});
