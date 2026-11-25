import { describe, expect, it } from 'vitest';

import { GeoPoint } from './geo-point/geo-point';
import { InvalidGeoPointException } from './geo-point/invalid-geo-point.exception';
import { InvalidLocationPrecisionException } from './location-precision/invalid-location-precision.exception';
import { LocationPrecision } from './location-precision/location-precision';
import { InvalidMunicipalityCodeException } from './municipality-code/invalid-municipality-code.exception';
import { MunicipalityCode } from './municipality-code/municipality-code';

describe('GeoPoint', () => {
  it('stores latitude and longitude', () => {
    const point = new GeoPoint(40.4168, -3.7038);
    expect(point.latitude).toBe(40.4168);
    expect(point.longitude).toBe(-3.7038);
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

describe('LocationPrecision', () => {
  it.each(['exact', 'approximate', 'municipality'])('accepts %s', (value) => {
    expect(new LocationPrecision(value).toPrimitives()).toBe(value);
  });

  it('rejects an unknown precision', () => {
    expect(() => new LocationPrecision('street')).toThrow(InvalidLocationPrecisionException);
  });
});

describe('MunicipalityCode', () => {
  it('accepts a five-digit INE code', () => {
    expect(new MunicipalityCode('28079').value).toBe('28079');
  });

  it.each(['2807', '280790', 'abcde', '', ' 28079'])('rejects %j', (value) => {
    expect(() => new MunicipalityCode(value)).toThrow(InvalidMunicipalityCodeException);
  });
});
