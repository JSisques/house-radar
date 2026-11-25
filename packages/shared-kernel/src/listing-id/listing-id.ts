import { generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';

/** Identity of a listing, referenced across contexts. UUIDv7. */
export class ListingId extends UuidValueObject {
  constructor(value: string) {
    super(value, { version: 7 });
  }

  static generate(): ListingId {
    return new ListingId(generateUuidV7());
  }
}
