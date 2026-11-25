import { generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';

/** Identity of a property, referenced across contexts. UUIDv7. */
export class PropertyId extends UuidValueObject {
  constructor(value: string) {
    super(value, { version: 7 });
  }

  static generate(): PropertyId {
    return new PropertyId(generateUuidV7());
  }
}
