import { AggregateRoot, generateEventMetadata } from '@house-radar/building-blocks';
import type { ListingId, PropertyId } from '@house-radar/shared-kernel';

import { PropertyCreatedEvent } from '@contexts/properties/domain/events/property-created/property-created.event';
import type { IListingReferenceProps } from '@contexts/properties/domain/interfaces/listing-reference-props.interface';
import type { IPropertyProps } from '@contexts/properties/domain/interfaces/property-props.interface';
import type { IPropertyPrimitives } from '@contexts/properties/domain/primitives/property.primitives';

/**
 * A real-world property. Minimal by design: it only knows which listings belong to it, and a listing belongs to
 * exactly one property. It also keeps the newest event version applied per listing, so late events can be ignored (D31).
 */
export class PropertyAggregate extends AggregateRoot<PropertyId> {
  private readonly listings: IListingReferenceProps[];

  constructor(props: IPropertyProps) {
    super(props.id);
    this.listings = props.listings.map((listing) => ({ ...listing }));
  }

  get listingIds(): readonly ListingId[] {
    return this.listings.map((listing) => listing.listingId);
  }

  hasListing(listingId: ListingId): boolean {
    return this.listings.some((listing) => listing.listingId.equals(listingId));
  }

  /** Newest applied event version for the listing, or null when the listing is not part of this property. */
  appliedVersionOf(listingId: ListingId): number | null {
    return this.listings.find((listing) => listing.listingId.equals(listingId))?.version ?? null;
  }

  /** Ordering guard (D31): true when the event version is newer than the one applied, so late events are ignored. */
  isNewerThanApplied(listingId: ListingId, version: number): boolean {
    const applied = this.appliedVersionOf(listingId);
    return applied === null || version > applied;
  }

  /** Remembers the newest event version applied for a member listing. */
  recordListingVersion(listingId: ListingId, version: number): void {
    const reference = this.listings.find((listing) => listing.listingId.equals(listingId));
    if (reference !== undefined) reference.version = version;
  }

  /** Records that the property was created. */
  create(): void {
    this.record(new PropertyCreatedEvent(generateEventMetadata(), this.toPrimitives()));
  }

  toPrimitives(): IPropertyPrimitives {
    return {
      id: this.id.value,
      listings: this.listings.map((listing) => ({ listingId: listing.listingId.value, version: listing.version })),
    };
  }
}
