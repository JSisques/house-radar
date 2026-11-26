import { describe, expect, it } from 'vitest';

import { ListingEventPayloadMapper } from '@contexts/properties/infrastructure/messaging/listing-event-payload/listing-event-payload.mapper';

const known = (value: unknown) => ({ kind: 'known', value, origin: 'declared' });
const UNKNOWN = { kind: 'unknown' };

describe('ListingEventPayloadMapper', () => {
  const mapper = new ListingEventPayloadMapper();

  describe('toAttributes', () => {
    it('should keep the known values and flatten the additional features', () => {
      const attributes = mapper.toAttributes({
        title: known('Piso en Vigo'),
        builtArea: known(100),
        usableArea: UNKNOWN,
        features: { garage: known(true), garden: UNKNOWN, energyCertificate: known('C') },
      });

      expect(attributes).toEqual({ title: 'Piso en Vigo', builtArea: 100, garage: true, energyCertificate: 'C' });
    });

    it('should leave out unknown values instead of reading them as zero or empty', () => {
      expect(mapper.toAttributes({ yearBuilt: UNKNOWN, bedrooms: known(0) })).toEqual({ bedrooms: 0 });
    });

    it('should ignore fields it does not know and values that are not primitives', () => {
      const attributes = mapper.toAttributes({
        price: known(20_000_000),
        externalId: 'x',
        bathrooms: known({ nested: 1 }),
        features: 'broken',
      });

      expect(attributes).toEqual({});
    });
  });

  describe('toPriceCents', () => {
    it('should read a known price', () => {
      expect(mapper.toPriceCents({ price: known(20_000_000) })).toBe(20_000_000);
    });

    it('should be null when the price is unknown, missing or not a number', () => {
      expect(mapper.toPriceCents({ price: UNKNOWN })).toBeNull();
      expect(mapper.toPriceCents({})).toBeNull();
      expect(mapper.toPriceCents({ price: known('cheap') })).toBeNull();
    });
  });
});
