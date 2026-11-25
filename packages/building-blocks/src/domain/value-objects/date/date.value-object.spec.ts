import { describe, expect, it } from 'vitest';

import { DateValueObject } from './date.value-object';
import { InvalidDateException } from './invalid-date.exception';

describe('DateValueObject', () => {
  it('accepts a valid date and exposes it as an ISO string primitive', () => {
    const vo = new DateValueObject(new Date('2026-01-01T00:00:00.000Z'));

    expect(vo.value.getTime()).toBe(Date.parse('2026-01-01T00:00:00.000Z'));
    expect(vo.toPrimitives()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('keeps its value unchanged when the source Date is mutated', () => {
    const source = new Date('2026-01-01T00:00:00.000Z');
    const vo = new DateValueObject(source);

    source.setUTCFullYear(2000);

    expect(vo.toPrimitives()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('keeps its value unchanged when the returned Date is mutated', () => {
    const vo = new DateValueObject(new Date('2026-01-01T00:00:00.000Z'));

    vo.value.setUTCFullYear(2000);

    expect(vo.toPrimitives()).toBe('2026-01-01T00:00:00.000Z');
  });

  it.each([
    ['an invalid date', new Date('nope'), {}],
    ['a non-Date value', '2026-01-01' as unknown as Date, {}],
    ['a date before min', new Date('2025-12-31T00:00:00.000Z'), { min: new Date('2026-01-01T00:00:00.000Z') }],
    ['a date after max', new Date('2026-01-02T00:00:00.000Z'), { max: new Date('2026-01-01T00:00:00.000Z') }],
  ])('rejects %s', (_label, value, options) => {
    expect(() => new DateValueObject(value, options)).toThrow(InvalidDateException);
  });

  it.each([
    ['an invalid min', { min: new Date('nope') }],
    ['min after max', { min: new Date('2026-02-01'), max: new Date('2026-01-01') }],
  ])('rejects an invalid option set: %s', (_label, options) => {
    expect(() => new DateValueObject(new Date('2026-01-15'), options)).toThrow(InvalidDateException);
  });

  it('throws an exception with a code', () => {
    expect(() => new DateValueObject(new Date('nope'))).toThrow(expect.objectContaining({ code: 'INVALID_DATE' }));
  });

  it('is equal to another instance with equal primitives', () => {
    const a = new DateValueObject(new Date('2026-01-01T00:00:00.000Z'));

    expect(a.equals(new DateValueObject(new Date('2026-01-01T00:00:00.000Z')))).toBe(true);
    expect(a.equals(new DateValueObject(new Date('2026-01-02T00:00:00.000Z')))).toBe(false);
  });
});
