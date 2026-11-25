import { generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';

/** Reference by ID to the ingestion run that produced an observation. UUIDv7. */
export class RunId extends UuidValueObject {
  constructor(value: string) {
    super(value, { version: 7 });
  }

  static generate(): RunId {
    return new RunId(generateUuidV7());
  }
}
