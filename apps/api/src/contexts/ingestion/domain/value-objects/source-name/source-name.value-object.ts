import { ValueObject } from '@house-radar/building-blocks';

import { InvalidSourceNameException } from '@contexts/ingestion/domain/exceptions/invalid-source-name/invalid-source-name.exception';

/** Where a source comes from, in words (for example idealista, fotocasa or manual). The identity is the id, not this name. */
export class SourceName extends ValueObject<string> {
  static manual(): SourceName {
    return new SourceName('manual');
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.length === 0) {
      throw new InvalidSourceNameException('value must be a non-empty string');
    }
    if (this._value.trim() !== this._value) {
      throw new InvalidSourceNameException('value must not have surrounding whitespace');
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
