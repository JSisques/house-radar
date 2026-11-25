import { ValueObject } from '@house-radar/building-blocks';

import { InvalidListingDescriptionException } from '@contexts/listings/domain/exceptions/invalid-listing-description/invalid-listing-description.exception';

/** Free-text description of the advertisement. */
export class ListingDescription extends ValueObject<string> {
  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'string' || this._value.trim().length === 0) {
      throw new InvalidListingDescriptionException('value must not be blank');
    }
    if (this._value.length > 20000)
      throw new InvalidListingDescriptionException('value must have at most 20000 characters');
  }

  toPrimitives(): string {
    return this._value;
  }
}
