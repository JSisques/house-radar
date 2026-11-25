import { describe, expect, it } from 'vitest';

import { generateUuidV7, InvalidUuidException } from '@house-radar/building-blocks';

import { SourceId } from './source-id';

describe('SourceId', () => {
  it('accepts a UUIDv7 and generates new ones', () => {
    const value = generateUuidV7();
    expect(new SourceId(value).value).toBe(value);
    expect(SourceId.generate().value).toMatch(/^[0-9a-f-]{36}$/);
    expect(SourceId.generate().equals(SourceId.generate())).toBe(false);
  });

  it('rejects anything that is not a UUIDv7', () => {
    expect(() => new SourceId('manual')).toThrow(InvalidUuidException);
    expect(() => new SourceId('550e8400-e29b-41d4-a716-446655440000')).toThrow(InvalidUuidException);
  });
});
