import { ValueObject } from '@house-radar/building-blocks';

import { InvalidMoneyException } from './invalid-money.exception';

/** Euro amount stored as a positive integer number of cents. */
export class Money extends ValueObject<number> {
  static fromEuros(euros: number): Money {
    const cents = Math.round(euros * 100);
    if (!Number.isFinite(euros) || Math.abs(euros * 100 - cents) > 1e-6) {
      throw new InvalidMoneyException('euros must map to a whole number of cents');
    }
    return new Money(cents);
  }

  get cents(): number {
    return this._value;
  }

  get euros(): number {
    return this._value / 100;
  }

  protected validate(): void {
    if (!Number.isSafeInteger(this._value)) throw new InvalidMoneyException('cents must be an integer');
    if (this._value <= 0) throw new InvalidMoneyException('amount must be greater than zero');
  }

  toPrimitives(): number {
    return this._value;
  }
}
