import { describe, expect, it } from 'vitest';

import { ENERGY_CERTIFICATE_VALUES, EnergyCertificate } from './energy-certificate/energy-certificate';
import { InvalidEnergyCertificateException } from './energy-certificate/invalid-energy-certificate.exception';
import { InvalidPropertyConditionException } from './property-condition/invalid-property-condition.exception';
import { PROPERTY_CONDITION_VALUES, PropertyCondition } from './property-condition/property-condition';
import { InvalidPropertyTypeException } from './property-type/invalid-property-type.exception';
import { PROPERTY_TYPE_VALUES, PropertyType } from './property-type/property-type';

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

describe('PropertyCondition', () => {
  it('accepts every value of the closed list (HR-F002-BR13)', () => {
    expect(PROPERTY_CONDITION_VALUES).toEqual(['new_build', 'good_condition', 'to_renovate', 'unknown']);
    for (const value of PROPERTY_CONDITION_VALUES) expect(new PropertyCondition(value).toPrimitives()).toBe(value);
  });

  it('rejects a condition outside the closed list (HR-F002-AC12)', () => {
    expect(() => new PropertyCondition('ruined')).toThrow(InvalidPropertyConditionException);
  });
});

describe('EnergyCertificate', () => {
  it('accepts letters A to G, in process, exempt and unknown (HR-F002-BR14)', () => {
    expect(ENERGY_CERTIFICATE_VALUES).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'in_process', 'exempt', 'unknown']);
    for (const value of ENERGY_CERTIFICATE_VALUES) expect(new EnergyCertificate(value).toPrimitives()).toBe(value);
  });

  it('models "in process" as a distinct value, not a letter (HR-F002-AC13)', () => {
    const inProcess = new EnergyCertificate('in_process');
    expect(inProcess.isLetter).toBe(false);
    expect(inProcess.equals(new EnergyCertificate('unknown'))).toBe(false);
    expect(new EnergyCertificate('A').isLetter).toBe(true);
  });

  it.each(['H', 'a', 'in process', ''])('rejects %j', (value) => {
    expect(() => new EnergyCertificate(value)).toThrow(InvalidEnergyCertificateException);
  });
});
