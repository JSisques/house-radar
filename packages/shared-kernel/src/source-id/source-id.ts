import { ValueObject } from '@house-radar/building-blocks';

import { InvalidSourceIdException } from './invalid-source-id.exception';

/** Identifier of a listing source (portal or manual import). */
export class SourceId extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.length === 0) {
      throw new InvalidSourceIdException('value must be a non-empty string');
    }
    if (this._value.trim() !== this._value) {
      throw new InvalidSourceIdException('value must not have surrounding whitespace');
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
