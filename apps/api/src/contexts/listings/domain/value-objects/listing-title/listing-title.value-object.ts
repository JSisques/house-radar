import { ValueObject } from '@house-radar/building-blocks';

import { InvalidListingTitleException } from '@contexts/listings/domain/exceptions/invalid-listing-title/invalid-listing-title.exception';

/** Headline of the advertisement, as the source states it. */
export class ListingTitle extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.trim().length === 0) {
      throw new InvalidListingTitleException('value must not be blank');
    }
    if (this._value.length > 300) throw new InvalidListingTitleException('value must have at most 300 characters');
  }

  toPrimitives(): string {
    return this._value;
  }
}
