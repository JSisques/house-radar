import { ValueObject } from '@house-radar/building-blocks';

import { InvalidSourceKindException } from '@contexts/ingestion/domain/exceptions/invalid-source-kind/invalid-source-kind.exception';

export const SOURCE_KIND_VALUES = ['api', 'feed', 'manual'] as const;

export type SourceKindValue = (typeof SOURCE_KIND_VALUES)[number];

/** Closed catalog of source kinds. */
export class SourceKind extends ValueObject<string> {
  static manual(): SourceKind {
    return new SourceKind('manual');
  }

  get value(): SourceKindValue {
    return this._value as SourceKindValue;
  }

  protected validate(): void {
    if (!(SOURCE_KIND_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidSourceKindException(`value must be one of: ${SOURCE_KIND_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
