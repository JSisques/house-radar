import { describe, expect, it } from 'vitest';

import { InvalidStringException } from './invalid-string.exception';
import { StringValueObject } from './string.value-object';

describe('StringValueObject', () => {
  it('accepts a value within its options', () => {
    const vo = new StringValueObject('abc', { minLength: 1, maxLength: 5, pattern: /^[a-z]+$/ });

    expect(vo.value).toBe('abc');
    expect(vo.toPrimitives()).toBe('abc');
  });

  it.each([
    ['a non-string value', 1 as unknown as string, {}],
    ['a value shorter than minLength', 'a', { minLength: 2 }],
    ['a value longer than maxLength', 'abc', { maxLength: 2 }],
    ['a value not matching the pattern', 'ab1', { pattern: /^[a-z]+$/ }],
  ])('rejects %s', (_label, value, options) => {
    expect(() => new StringValueObject(value, options)).toThrow(InvalidStringException);
  });

  it.each([
    ['a negative minLength', { minLength: -1 }],
    ['a non-integer maxLength', { maxLength: 1.5 }],
    ['minLength greater than maxLength', { minLength: 3, maxLength: 2 }],
  ])('rejects an invalid option set: %s', (_label, options) => {
    expect(() => new StringValueObject('abc', options)).toThrow(InvalidStringException);
  });

  it('throws an exception with a code', () => {
    expect(() => new StringValueObject('a', { minLength: 2 })).toThrow(
      expect.objectContaining({ code: 'INVALID_STRING' }),
    );
  });

  it('is equal to another instance with equal primitives', () => {
    expect(new StringValueObject('a').equals(new StringValueObject('a'))).toBe(true);
    expect(new StringValueObject('a').equals(new StringValueObject('b'))).toBe(false);
  });
});
