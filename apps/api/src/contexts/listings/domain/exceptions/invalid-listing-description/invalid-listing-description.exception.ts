import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingDescriptionException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LISTING_DESCRIPTION', `Invalid listing description: ${reason}`);
  }
}
