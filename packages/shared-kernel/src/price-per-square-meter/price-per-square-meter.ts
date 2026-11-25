import { ValueObject } from '@house-radar/building-blocks';

import { Area } from '../area/area';
import { Known, known, Maybe, UNKNOWN } from '../known/known';
import { Money } from '../money/money';

/** Price per square meter of built area, stored as cents per m2. */
export class PricePerSquareMeter extends ValueObject<Money> {
  /**
   * Price divided by the built area only (never usable area, D20). Unknown without built area,
   * or when the result would be below one cent.
   */
  static calculate(price: Money, builtArea: Maybe<Area>): Maybe<PricePerSquareMeter> {
    if (builtArea.kind === 'unknown') return UNKNOWN;
    const cents = Math.round(price.cents / builtArea.value.squareMeters);
    if (cents < 1) return UNKNOWN;
    return known(new PricePerSquareMeter(new Money(cents)), 'calculated');
  }

  get money(): Money {
    return this._value;
  }

  protected validate(): void {
    // Money already guarantees a positive integer amount.
  }

  toPrimitives(): number {
    return this._value.cents;
  }
}

export type CalculatedPricePerSquareMeter = Known<PricePerSquareMeter>;
