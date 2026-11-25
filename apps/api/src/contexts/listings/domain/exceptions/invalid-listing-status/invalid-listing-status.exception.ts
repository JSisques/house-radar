import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingStatusException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LISTING_STATUS', `Invalid listing status: ${reason}`);
  }
}
