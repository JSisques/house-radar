import { ValueObject } from '@house-radar/building-blocks';

import { InvalidExternalIdException } from './invalid-external-id.exception';

/** Identifier of a listing within its source; unique together with the `SourceId`. */
export class ExternalId extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.length === 0) {
      throw new InvalidExternalIdException('value must be a non-empty string');
    }
    if (this._value.trim() !== this._value) {
      throw new InvalidExternalIdException('value must not have surrounding whitespace');
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
