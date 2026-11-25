import { ValueObject } from '@house-radar/building-blocks';

import { InvalidAreaException } from './invalid-area.exception';

/** Surface in square meters; always finite and greater than zero. */
export class Area extends ValueObject<number> {
  get squareMeters(): number {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'number' || !Number.isFinite(this._value)) {
      throw new InvalidAreaException('value must be a finite number');
    }
    if (this._value <= 0) throw new InvalidAreaException('value must be greater than zero');
  }

  toPrimitives(): number {
    return this._value;
  }
}
