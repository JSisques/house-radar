import { describe, expect, it } from 'vitest';

import { InvalidUuidException } from './invalid-uuid.exception';
import { UuidValueObject } from './uuid.value-object';

const UUID_V7 = '018f3c1e-7b5a-7cde-8f12-3456789abcde';
const UUID_V4 = '3b241101-e2bb-4255-8caf-4136c566a962';

describe('UuidValueObject', () => {
  it('accepts a well-formed UUID', () => {
    const vo = new UuidValueObject(UUID_V4);

    expect(vo.value).toBe(UUID_V4);
    expect(vo.toPrimitives()).toBe(UUID_V4);
  });

  it('accepts a UUID of the required version', () => {
    expect(new UuidValueObject(UUID_V7, { version: 7 }).value).toBe(UUID_V7);
  });

  it.each([
    ['a non-string value', 1 as unknown as string, {}],
    ['a malformed UUID', 'not-a-uuid', {}],
    ['an empty string', '', {}],
    ['a UUID of another version', UUID_V4, { version: 7 }],
  ])('rejects %s', (_label, value, options) => {
    expect(() => new UuidValueObject(value, options)).toThrow(InvalidUuidException);
  });

  it.each([
    ['a version of 0', { version: 0 }],
    ['a version above 8', { version: 9 }],
    ['a non-integer version', { version: 4.5 }],
  ])('rejects an invalid option set: %s', (_label, options) => {
    expect(() => new UuidValueObject(UUID_V4, options)).toThrow(InvalidUuidException);
  });

  it('throws an exception with a code', () => {
    expect(() => new UuidValueObject('x')).toThrow(expect.objectContaining({ code: 'INVALID_UUID' }));
  });

  it('is equal to another instance with equal primitives', () => {
    expect(new UuidValueObject(UUID_V4).equals(new UuidValueObject(UUID_V4))).toBe(true);
    expect(new UuidValueObject(UUID_V4).equals(new UuidValueObject(UUID_V7))).toBe(false);
  });
});
