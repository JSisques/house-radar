import { describe, expect, it } from 'vitest';

import { readListingAttributes } from '@contexts/properties/domain/services/listing-attributes-reader/listing-attributes.reader';

const known = (value: unknown) => ({ kind: 'known', value, origin: 'declared' });
const UNKNOWN = { kind: 'unknown' };

describe('readListingAttributes', () => {
  it('should keep the known values and flatten the additional features', () => {
    const attributes = readListingAttributes({
      title: known('Piso en Vigo'),
      builtArea: known(100),
      usableArea: UNKNOWN,
      features: { garage: known(true), garden: UNKNOWN, energyCertificate: known('C') },
    });

    expect(attributes).toEqual({ title: 'Piso en Vigo', builtArea: 100, garage: true, energyCertificate: 'C' });
  });

  it('should leave out unknown values instead of reading them as zero or empty', () => {
    expect(readListingAttributes({ yearBuilt: UNKNOWN, bedrooms: known(0) })).toEqual({ bedrooms: 0 });
  });

  it('should ignore fields it does not know and values that are not primitives', () => {
    const attributes = readListingAttributes({
      price: known(20_000_000),
      externalId: 'x',
      bathrooms: known({ nested: 1 }),
      features: 'broken',
    });

    expect(attributes).toEqual({});
  });
});
