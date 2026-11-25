import { ValueObject } from '@house-radar/building-blocks';

import { InvalidYearBuiltException } from '@contexts/listings/domain/exceptions/invalid-year-built/invalid-year-built.exception';

const MIN_YEAR = 1000;
const FUTURE_YEARS_ALLOWED = 10;

/** Year of construction. A missing year is `Unknown`, never zero or empty. Off-plan builds may be a few years ahead. */
export class YearBuilt extends ValueObject<number> {
  get value(): number {
    return this._value;
  }

  protected validate(): void {
    if (!Number.isInteger(this._value)) throw new InvalidYearBuiltException('value must be a whole number');
    const maxYear = new Date().getUTCFullYear() + FUTURE_YEARS_ALLOWED;
    if (this._value < MIN_YEAR || this._value > maxYear) {
      throw new InvalidYearBuiltException(`value must be between ${MIN_YEAR} and ${maxYear}`);
    }
  }

  toPrimitives(): number {
    return this._value;
  }
}
