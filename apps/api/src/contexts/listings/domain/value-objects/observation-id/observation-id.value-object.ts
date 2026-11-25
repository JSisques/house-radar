import { generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';

/** Identity of an observation. UUIDv7. */
export class ObservationId extends UuidValueObject {
  constructor(value: string) {
    super(value, { version: 7 });
  }

  static generate(): ObservationId {
    return new ObservationId(generateUuidV7());
  }
}
