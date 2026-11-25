import { describe, expect, it } from 'vitest';

import { generateUuidV7, InvalidUuidException } from '@house-radar/building-blocks';

import { ListingId } from './listing-id';

describe('ListingId', () => {
  it('accepts a UUIDv7 and generates new ones', () => {
    const value = generateUuidV7();
    expect(new ListingId(value).value).toBe(value);
    expect(ListingId.generate().value).toMatch(/^[0-9a-f-]{36}$/);
    expect(ListingId.generate().equals(ListingId.generate())).toBe(false);
  });

  it('rejects anything that is not a UUIDv7', () => {
    expect(() => new ListingId('not-a-uuid')).toThrow(InvalidUuidException);
    expect(() => new ListingId('550e8400-e29b-41d4-a716-446655440000')).toThrow(InvalidUuidException);
  });
});
