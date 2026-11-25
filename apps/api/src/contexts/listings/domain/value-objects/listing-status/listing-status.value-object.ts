import { ValueObject } from '@house-radar/building-blocks';

import { InvalidListingStatusException } from '@contexts/listings/domain/exceptions/invalid-listing-status/invalid-listing-status.exception';

export const LISTING_STATUS_VALUES = ['active', 'disappeared', 'unknown'] as const;

export type ListingStatusValue = (typeof LISTING_STATUS_VALUES)[number];

/** Closed catalog of listing statuses (HR-F002-BR6). */
export class ListingStatus extends ValueObject<string> {
  static active(): ListingStatus {
    return new ListingStatus('active');
  }

  get value(): ListingStatusValue {
    return this._value as ListingStatusValue;
  }

  protected validate(): void {
    if (!(LISTING_STATUS_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidListingStatusException(`value must be one of: ${LISTING_STATUS_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
