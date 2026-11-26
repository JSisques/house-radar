import { Builder } from '@house-radar/building-blocks';
import { type ListingId, PropertyId } from '@house-radar/shared-kernel';

import { PropertyAggregate } from '@contexts/properties/domain/aggregates/property/property.aggregate';
import type { IListingReferenceProps } from '@contexts/properties/domain/interfaces/listing-reference-props.interface';

/** Builds a property. Without an id it gets a fresh UUIDv7; it needs at least one listing. */
export class PropertyBuilder extends Builder<PropertyAggregate> {
  private idValue?: PropertyId;
  private readonly listingsValue: IListingReferenceProps[] = [];

  withId(id: PropertyId): this {
    this.idValue = id;
    return this;
  }

  withListing(listingId: ListingId, version: number): this {
    this.listingsValue.push({ listingId, version });
    return this;
  }

  protected requiredFields(): Readonly<Record<string, unknown>> {
    return { listings: this.listingsValue.length === 0 ? undefined : this.listingsValue };
  }

  build(): PropertyAggregate {
    this.validate();
    return new PropertyAggregate({ id: this.idValue ?? PropertyId.generate(), listings: this.listingsValue });
  }
}
