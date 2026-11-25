import { ValueObject } from '@house-radar/building-blocks';

import { InvalidLandTypeException } from '@contexts/listings/domain/exceptions/invalid-land-type/invalid-land-type.exception';

/** Land classification as the source states it (for example urban or rustic). */
export class LandType extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.trim().length === 0) {
      throw new InvalidLandTypeException('value must not be blank');
    }
    if (this._value.length > 100) throw new InvalidLandTypeException('value must have at most 100 characters');
  }

  toPrimitives(): string {
    return this._value;
  }
}
