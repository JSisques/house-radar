// Path: src/contexts/<context>/domain/exceptions/invalid-<name>/invalid-<name>.exception.ts
import { DomainException } from '@house-radar/building-blocks';

export class InvalidListingTitleException extends DomainException {
  constructor(value: string) {
    super({ code: 'INVALID_LISTING_TITLE', message: `Invalid listing title: "${value}"` });
  }
}
