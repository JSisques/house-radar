import { describe, expect, it } from 'vitest';

import { InvalidPropertyTypeException } from './invalid-property-type.exception';
import { PROPERTY_TYPE_VALUES, PropertyType } from './property-type';

describe('PropertyType', () => {
  it('accepts every value of the closed list (HR-F002-BR12)', () => {
    expect(PROPERTY_TYPE_VALUES).toEqual([
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
    ]);
    for (const value of PROPERTY_TYPE_VALUES) expect(new PropertyType(value).toPrimitives()).toBe(value);
  });

  it('rejects a type outside the closed list (HR-F002-AC11)', () => {
    expect(() => new PropertyType('castle')).toThrow(InvalidPropertyTypeException);
  });

  it('compares by value', () => {
    expect(new PropertyType('flat').equals(new PropertyType('flat'))).toBe(true);
    expect(new PropertyType('flat').equals(new PropertyType('land'))).toBe(false);
  });
});
