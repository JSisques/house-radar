import { describe, expect, it } from 'vitest';

import { generateUuidV7, InvalidUuidException } from '@house-radar/building-blocks';

import { ListingId } from '../listing-id/listing-id';
import { PropertyId } from './property-id';

describe('PropertyId', () => {
  it('accepts a UUIDv7 and generates new ones', () => {
    const value = generateUuidV7();
    expect(new PropertyId(value).value).toBe(value);
    expect(PropertyId.generate().value).toMatch(/^[0-9a-f-]{36}$/);
    expect(PropertyId.generate().equals(PropertyId.generate())).toBe(false);
  });

  it('rejects anything that is not a UUIDv7', () => {
    expect(() => new PropertyId('not-a-uuid')).toThrow(InvalidUuidException);
    expect(() => new PropertyId('550e8400-e29b-41d4-a716-446655440000')).toThrow(InvalidUuidException);
  });

  it('is never equal to a ListingId with the same value', () => {
    const value = generateUuidV7();
    expect(new PropertyId(value).equals(new ListingId(value))).toBe(false);
  });
});
