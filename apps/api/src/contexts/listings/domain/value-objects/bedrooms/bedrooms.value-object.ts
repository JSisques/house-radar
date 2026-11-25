import { ValueObject } from '@house-radar/building-blocks';

import { InvalidBedroomCountException } from '@contexts/listings/domain/exceptions/invalid-bedroom-count/invalid-bedroom-count.exception';

/** Number of bedrooms; zero is valid (a studio). An unknown count is `Unknown`, never zero. */
export class Bedrooms extends ValueObject<number> {
  get value(): number {
    return this._value;
  }

  protected validate(): void {
    if (!Number.isInteger(this._value)) throw new InvalidBedroomCountException('value must be a whole number');
    if (this._value < 0) throw new InvalidBedroomCountException('value must not be negative');
    if (this._value > 100) throw new InvalidBedroomCountException('value must be at most 100');
  }

  toPrimitives(): number {
    return this._value;
  }
}
