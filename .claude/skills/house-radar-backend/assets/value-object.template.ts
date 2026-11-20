// Path: src/contexts/<context>/domain/value-objects/<name>/<name>.value-object.ts
// Used by >= 2 contexts? Put it in packages/shared-kernel instead. One typed exception per VO (own file).
import { ValueObject } from '@house-radar/building-blocks';

import { InvalidListingTitleException } from '@contexts/listings/domain/exceptions/invalid-listing-title/invalid-listing-title.exception';

export class ListingTitle extends ValueObject<string> {
  protected validate(): void {
    if (this.value.trim().length === 0 || this.value.length > 200) {
      throw new InvalidListingTitleException(this.value);
    }
  }
}
