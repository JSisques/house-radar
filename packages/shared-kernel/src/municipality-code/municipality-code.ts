import { ValueObject } from '@house-radar/building-blocks';

import { InvalidMunicipalityCodeException } from './invalid-municipality-code.exception';

const INE_CODE_PATTERN = /^\d{5}$/;

/** INE municipality code: five digits, two of province and three of municipality. */
export class MunicipalityCode extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || !INE_CODE_PATTERN.test(this._value)) {
      throw new InvalidMunicipalityCodeException('value must be a five-digit INE code');
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
