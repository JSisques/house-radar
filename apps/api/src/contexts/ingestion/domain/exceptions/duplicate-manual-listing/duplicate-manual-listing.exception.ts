import { DomainException } from '@house-radar/building-blocks';

/** A manual listing with the same normalized URL already exists. */
export class DuplicateManualListingException extends DomainException {
  constructor(readonly listingId: string) {
    super('DUPLICATE_MANUAL_LISTING', `A listing with this URL already exists: ${listingId}`);
  }
}
