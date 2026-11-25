import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingTitleException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LISTING_TITLE', `Invalid listing title: ${reason}`);
  }
}
