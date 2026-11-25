// Path: src/contexts/<context>/domain/exceptions/invalid-<name>/invalid-<name>.exception.ts
// DomainException takes a stable machine-readable code and a message.
import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingTitleException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LISTING_TITLE', `Invalid listing title: ${reason}`);
  }
}
