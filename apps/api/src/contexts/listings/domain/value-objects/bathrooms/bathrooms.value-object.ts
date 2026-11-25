import { ValueObject } from '@house-radar/building-blocks';

import { InvalidBathroomCountException } from '@contexts/listings/domain/exceptions/invalid-bathroom-count/invalid-bathroom-count.exception';

/** Number of bathrooms. An unknown count is `Unknown`, never zero. */
export class Bathrooms extends ValueObject<number> {
  get value(): number {
    return this._value;
  }

  protected validate(): void {
    if (!Number.isInteger(this._value)) throw new InvalidBathroomCountException('value must be a whole number');
    if (this._value < 0) throw new InvalidBathroomCountException('value must not be negative');
    if (this._value > 100) throw new InvalidBathroomCountException('value must be at most 100');
  }

  toPrimitives(): number {
    return this._value;
  }
}
