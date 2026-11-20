// Path: src/contexts/<context>/domain/value-objects/<name>/<name>.value-object.ts
// Used by >= 2 contexts? Put it in packages/shared-kernel instead.
import { DomainException, ValueObject } from '@house-radar/building-blocks';

export class InvalidListingTitleException extends DomainException {
  constructor(value: string) {
    super({ code: 'INVALID_LISTING_TITLE', message: `Invalid listing title: "${value}"` });
  }
}

export class ListingTitle extends ValueObject<string> {
  protected validate(): void {
    if (this.value.trim().length === 0 || this.value.length > 200) {
      throw new InvalidListingTitleException(this.value);
    }
  }
}
