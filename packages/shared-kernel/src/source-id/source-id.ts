import { generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';

/** Identity of a listing source (portal, feed or manual import), referenced across contexts. UUIDv7. */
export class SourceId extends UuidValueObject {
  constructor(value: string) {
    super(value, { version: 7 });
  }

  static generate(): SourceId {
    return new SourceId(generateUuidV7());
  }
}
