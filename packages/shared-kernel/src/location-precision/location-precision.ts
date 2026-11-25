import { ValueObject } from '@house-radar/building-blocks';

import { InvalidLocationPrecisionException } from './invalid-location-precision.exception';

export const LOCATION_PRECISION_VALUES = ['exact', 'approximate', 'municipality'] as const;

export type LocationPrecisionValue = (typeof LOCATION_PRECISION_VALUES)[number];

/** How precisely a pin locates a property (D18). */
export class LocationPrecision extends ValueObject<string> {
  get value(): LocationPrecisionValue {
    return this._value as LocationPrecisionValue;
  }

  protected validate(): void {
    if (!(LOCATION_PRECISION_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidLocationPrecisionException(`value must be one of: ${LOCATION_PRECISION_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
