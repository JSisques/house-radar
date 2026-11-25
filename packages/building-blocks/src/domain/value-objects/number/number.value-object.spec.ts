import { describe, expect, it } from 'vitest';

import { InvalidNumberException } from './invalid-number.exception';
import { NumberValueObject } from './number.value-object';

describe('NumberValueObject', () => {
  it('accepts a value within its options', () => {
    const vo = new NumberValueObject(5, { min: 0, max: 10, integer: true });

    expect(vo.value).toBe(5);
    expect(vo.toPrimitives()).toBe(5);
  });

  it.each([
    ['a non-number value', '1' as unknown as number, {}],
    ['NaN', Number.NaN, {}],
    ['Infinity', Number.POSITIVE_INFINITY, {}],
    ['a value below min', -1, { min: 0 }],
    ['a value above max', 11, { max: 10 }],
    ['a non-integer when integer is required', 1.5, { integer: true }],
  ])('rejects %s', (_label, value, options) => {
    expect(() => new NumberValueObject(value, options)).toThrow(InvalidNumberException);
  });

  it.each([
    ['a non-finite min', { min: Number.NaN }],
    ['min greater than max', { min: 5, max: 1 }],
  ])('rejects an invalid option set: %s', (_label, options) => {
    expect(() => new NumberValueObject(1, options)).toThrow(InvalidNumberException);
  });

  it('throws an exception with a code', () => {
    expect(() => new NumberValueObject(-1, { min: 0 })).toThrow(expect.objectContaining({ code: 'INVALID_NUMBER' }));
  });

  it('is equal to another instance with equal primitives', () => {
    expect(new NumberValueObject(1).equals(new NumberValueObject(1))).toBe(true);
    expect(new NumberValueObject(1).equals(new NumberValueObject(2))).toBe(false);
  });
});
