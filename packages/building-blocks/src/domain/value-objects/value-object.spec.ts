import { describe, expect, it } from 'vitest';

import { ValueObject } from './value-object';

let validations = 0;

class Name extends ValueObject<string> {
  protected validate(): void {
    validations += 1;
  }

  toPrimitives(): string {
    return this._value;
  }
}

class Label extends ValueObject<string> {
  protected validate(): void {}

  toPrimitives(): string {
    return this._value;
  }
}

type PointPrimitives = { x: number; y: number };

class Point extends ValueObject<PointPrimitives> {
  protected validate(): void {}

  toPrimitives(): PointPrimitives {
    return { x: this._value.x, y: this._value.y };
  }
}

describe('ValueObject with composite primitives', () => {
  it('is equal when every field of the primitives is equal', () => {
    expect(new Point({ x: 1, y: 2 }).equals(new Point({ x: 1, y: 2 }))).toBe(true);
  });

  it('is not equal when any field differs', () => {
    expect(new Point({ x: 1, y: 2 }).equals(new Point({ x: 1, y: 3 }))).toBe(false);
  });

  it('is not equal to a scalar value object', () => {
    expect(new Point({ x: 1, y: 2 }).equals(new Name('a'))).toBe(false);
  });
});

describe('ValueObject', () => {
  it('runs validate() on construction', () => {
    validations = 0;
    new Name('a');
    expect(validations).toBe(1);
  });

  it('is equal to another value object of the same class with equal primitives', () => {
    expect(new Name('a').equals(new Name('a'))).toBe(true);
  });

  it('is not equal when the primitives differ', () => {
    expect(new Name('a').equals(new Name('b'))).toBe(false);
  });

  it('is not equal to a value object of another class with the same primitives', () => {
    expect(new Name('a').equals(new Label('a'))).toBe(false);
  });

  it('is not equal to null or undefined', () => {
    expect(new Name('a').equals(null)).toBe(false);
    expect(new Name('a').equals(undefined)).toBe(false);
  });
});
