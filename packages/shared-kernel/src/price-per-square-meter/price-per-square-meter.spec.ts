import { describe, expect, it } from 'vitest';

import { Area } from '../area/area';
import { isKnown, isUnknown, known, UNKNOWN } from '../known/known';
import { Money } from '../money/money';
import { PricePerSquareMeter } from './price-per-square-meter';

describe('PricePerSquareMeter.calculate', () => {
  it('computes 2 000 EUR/m2 marked calculated for 100 m2 and 200 000 EUR (HR-F002-AC3)', () => {
    const result = PricePerSquareMeter.calculate(Money.fromEuros(200_000), known(new Area(100), 'declared'));
    expect(isKnown(result)).toBe(true);
    if (!isKnown(result)) return;
    expect(result.origin).toBe('calculated');
    expect(result.value.money.euros).toBe(2_000);
    expect(result.value.toPrimitives()).toBe(200_000);
  });

  it('is Unknown without built area (HR-F002-AC4)', () => {
    expect(isUnknown(PricePerSquareMeter.calculate(Money.fromEuros(200_000), UNKNOWN))).toBe(true);
  });

  it('rounds to the nearest cent', () => {
    const result = PricePerSquareMeter.calculate(new Money(100), known(new Area(3), 'declared'));
    expect(isKnown(result) && result.value.money.cents).toBe(33);
  });

  it('is Unknown when the result is below one cent', () => {
    expect(isUnknown(PricePerSquareMeter.calculate(new Money(1), known(new Area(1000), 'declared')))).toBe(true);
  });
});
