import { describe, expect, it } from 'vitest';

import { InvalidMoneyException } from './invalid-money.exception';
import { Money } from './money';

describe('Money', () => {
  it('stores integer euro cents', () => {
    const money = Money.fromEuros(200_000);
    expect(money.cents).toBe(20_000_000);
    expect(money.euros).toBe(200_000);
    expect(money.toPrimitives()).toBe(20_000_000);
  });

  it('builds from cents and compares by value', () => {
    expect(new Money(150).equals(new Money(150))).toBe(true);
    expect(new Money(150).equals(new Money(151))).toBe(false);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s cents', (cents) => {
    expect(() => new Money(cents)).toThrow(InvalidMoneyException);
  });

  it('rejects euro amounts that do not map to whole cents', () => {
    expect(() => Money.fromEuros(0.001)).toThrow(InvalidMoneyException);
    expect(Money.fromEuros(10.55).cents).toBe(1055);
  });
});
