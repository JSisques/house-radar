import { ValueObject } from '@house-radar/building-blocks';

import { InvalidPropertyTypeException } from './invalid-property-type.exception';

export const PROPERTY_TYPE_VALUES = [
  'flat',
  'penthouse',
  'duplex',
  'studio',
  'detached_house',
  'semi_detached_or_terraced_house',
  'rustic_house',
  'estate',
  'land',
  'other',
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPE_VALUES)[number];

/** Closed catalog of property types (HR-F002-BR12). */
export class PropertyType extends ValueObject<string> {
  get value(): PropertyTypeValue {
    return this._value as PropertyTypeValue;
  }

  protected validate(): void {
    if (!(PROPERTY_TYPE_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidPropertyTypeException(`value must be one of: ${PROPERTY_TYPE_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
