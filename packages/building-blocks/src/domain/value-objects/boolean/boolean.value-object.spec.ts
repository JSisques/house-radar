import { describe, expect, it } from 'vitest';

import { BooleanValueObject } from './boolean.value-object';
import { InvalidBooleanException } from './invalid-boolean.exception';

describe('BooleanValueObject', () => {
  it('accepts true and false', () => {
    expect(new BooleanValueObject(true).value).toBe(true);
    expect(new BooleanValueObject(false).toPrimitives()).toBe(false);
  });

  it.each([
    ['a string', 'true'],
    ['a number', 1],
    ['null', null],
  ])('rejects %s', (_label, value) => {
    expect(() => new BooleanValueObject(value as unknown as boolean)).toThrow(InvalidBooleanException);
  });

  it('throws an exception with a code', () => {
    expect(() => new BooleanValueObject(1 as unknown as boolean)).toThrow(
      expect.objectContaining({ code: 'INVALID_BOOLEAN' }),
    );
  });

  it('is equal to another instance with equal primitives', () => {
    expect(new BooleanValueObject(true).equals(new BooleanValueObject(true))).toBe(true);
    expect(new BooleanValueObject(true).equals(new BooleanValueObject(false))).toBe(false);
  });
});
