import { describe, expect, it } from 'vitest';

import { generateUuidV7 } from './generate-uuid-v7';
import { UuidValueObject } from './uuid.value-object';

describe('generateUuidV7', () => {
  it('returns a valid version 7 UUID', () => {
    expect(() => new UuidValueObject(generateUuidV7(), { version: 7 })).not.toThrow();
  });

  it('keeps generation order when sorted', () => {
    const ids = Array.from({ length: 50 }, () => generateUuidV7());
    expect([...ids].sort()).toEqual(ids);
  });
});
