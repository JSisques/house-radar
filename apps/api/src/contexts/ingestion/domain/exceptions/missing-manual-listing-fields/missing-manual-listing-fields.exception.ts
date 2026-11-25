import { DomainException } from '@house-radar/building-blocks';

/** A manual listing import was requested without all of its required fields. */
export class MissingManualListingFieldsException extends DomainException {
  constructor(readonly missingFields: readonly string[]) {
    super('MISSING_MANUAL_LISTING_FIELDS', `Missing required fields: ${missingFields.join(', ')}`);
  }
}
