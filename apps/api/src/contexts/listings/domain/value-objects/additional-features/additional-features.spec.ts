import { describe, expect, it } from 'vitest';

import { EnergyCertificate, known, UNKNOWN } from '@house-radar/shared-kernel';

import { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';

describe('AdditionalFeatures', () => {
  it('has every feature unknown by default, never false', () => {
    const primitives = AdditionalFeatures.unknown().toPrimitives();

    expect(Object.keys(primitives).sort()).toEqual(
      [
        'balcony',
        'electricity',
        'elevator',
        'energyCertificate',
        'garage',
        'garden',
        'heating',
        'landType',
        'sanitation',
        'swimmingPool',
        'terrace',
        'water',
      ].sort(),
    );
    for (const value of Object.values(primitives)) expect(value).toEqual({ kind: 'unknown' });
  });

  it('keeps stated features and leaves the rest unknown', () => {
    const features = new AdditionalFeatures({
      garage: known(true, 'declared'),
      elevator: known(false, 'declared'),
      energyCertificate: known(new EnergyCertificate('in_process'), 'declared'),
      landType: known(new LandType('rustico'), 'declared'),
    });
    const primitives = features.toPrimitives();

    expect(primitives.garage).toEqual({ kind: 'known', value: true, origin: 'declared' });
    expect(primitives.elevator).toEqual({ kind: 'known', value: false, origin: 'declared' });
    expect(primitives.energyCertificate).toEqual({ kind: 'known', value: 'in_process', origin: 'declared' });
    expect(primitives.landType).toEqual({ kind: 'known', value: 'rustico', origin: 'declared' });
    expect(primitives.garden).toEqual({ kind: 'unknown' });
    expect(features.garage).not.toBe(UNKNOWN);
  });
});
