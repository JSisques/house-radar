import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingUrlException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LISTING_URL', `Invalid listing URL: ${reason}`);
  }
}
