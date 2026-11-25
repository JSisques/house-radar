import { describe, expect, it } from 'vitest';

import { EnumValueObject } from './enum.value-object';
import { InvalidEnumException } from './invalid-enum.exception';

const STATUSES = ['active', 'archived'] as const;

describe('EnumValueObject', () => {
  it('accepts a member of the allowed values', () => {
    const vo = new EnumValueObject('active', { values: STATUSES });

    expect(vo.value).toBe('active');
    expect(vo.toPrimitives()).toBe('active');
  });

  it('rejects a value outside the allowed values', () => {
    expect(() => new EnumValueObject('deleted', { values: STATUSES })).toThrow(InvalidEnumException);
  });

  it.each([
    ['no values', { values: [] }],
    ['duplicated values', { values: ['a', 'a'] }],
  ])('rejects an invalid option set: %s', (_label, options) => {
    expect(() => new EnumValueObject('a', options)).toThrow(InvalidEnumException);
  });

  it('throws an exception with a code', () => {
    expect(() => new EnumValueObject('x', { values: STATUSES })).toThrow(
      expect.objectContaining({ code: 'INVALID_ENUM' }),
    );
  });

  it('is equal to another instance with equal primitives', () => {
    const options = { values: STATUSES };

    expect(new EnumValueObject('active', options).equals(new EnumValueObject('active', options))).toBe(true);
    expect(new EnumValueObject('active', options).equals(new EnumValueObject('archived', options))).toBe(false);
  });
});
