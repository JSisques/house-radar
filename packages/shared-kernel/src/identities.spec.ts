import { describe, expect, it } from 'vitest';

import { generateUuidV7, InvalidUuidException } from '@house-radar/building-blocks';

import { ExternalId } from './external-id/external-id';
import { InvalidExternalIdException } from './external-id/invalid-external-id.exception';
import { ListingId } from './listing-id/listing-id';
import { PropertyId } from './property-id/property-id';
import { InvalidSourceIdException } from './source-id/invalid-source-id.exception';
import { SourceId } from './source-id/source-id';

describe('SourceId', () => {
  it('stores a non-empty trimmed identifier', () => {
    expect(new SourceId('fotocasa').value).toBe('fotocasa');
  });

  it.each(['', '   ', ' fotocasa'])('rejects %j', (value) => {
    expect(() => new SourceId(value)).toThrow(InvalidSourceIdException);
  });
});

describe('ExternalId', () => {
  it('stores a non-empty trimmed identifier', () => {
    expect(new ExternalId('184723').value).toBe('184723');
  });

  it.each(['', '   ', '184723 '])('rejects %j', (value) => {
    expect(() => new ExternalId(value)).toThrow(InvalidExternalIdException);
  });
});

describe.each([
  ['PropertyId', PropertyId],
  ['ListingId', ListingId],
] as const)('%s', (_name, Id) => {
  it('accepts a UUIDv7 and generates new ones', () => {
    const value = generateUuidV7();
    expect(new Id(value).value).toBe(value);
    expect(Id.generate().value).toMatch(/^[0-9a-f-]{36}$/);
    expect(Id.generate().equals(Id.generate())).toBe(false);
  });

  it('rejects anything that is not a UUIDv7', () => {
    expect(() => new Id('not-a-uuid')).toThrow(InvalidUuidException);
    expect(() => new Id('550e8400-e29b-41d4-a716-446655440000')).toThrow(InvalidUuidException);
  });
});

describe('identity types', () => {
  it('never equal across types', () => {
    const value = generateUuidV7();
    expect(new PropertyId(value).equals(new ListingId(value))).toBe(false);
  });
});
