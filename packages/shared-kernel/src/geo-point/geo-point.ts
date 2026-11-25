import { ValueObject } from '@house-radar/building-blocks';

import { InvalidGeoPointException } from './invalid-geo-point.exception';

// A type alias, not an interface: composite primitives must be assignable to an index signature.
export type GeoPointPrimitives = { latitude: number; longitude: number };

/** WGS84 coordinate. Latitude in [-90, 90], longitude in [-180, 180]. */
export class GeoPoint extends ValueObject<GeoPointPrimitives> {
  constructor(latitude: number, longitude: number) {
    super({ latitude, longitude });
  }

  get latitude(): number {
    return this._value.latitude;
  }

  get longitude(): number {
    return this._value.longitude;
  }

  protected validate(): void {
    const { latitude, longitude } = this._value;
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new InvalidGeoPointException('latitude must be a finite number between -90 and 90');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new InvalidGeoPointException('longitude must be a finite number between -180 and 180');
    }
  }

  toPrimitives(): GeoPointPrimitives {
    return { latitude: this._value.latitude, longitude: this._value.longitude };
  }
}
