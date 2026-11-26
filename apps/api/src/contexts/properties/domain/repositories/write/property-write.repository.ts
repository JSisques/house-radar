import type { IWriteRepository } from '@house-radar/building-blocks';
import type { ListingId, PropertyId } from '@house-radar/shared-kernel';

import type { PropertyAggregate } from '@contexts/properties/domain/aggregates/property/property.aggregate';

export const PROPERTY_WRITE_REPOSITORY = Symbol('PROPERTY_WRITE_REPOSITORY');

/** Stores properties. A listing belongs to exactly one of them. */
export interface IPropertyWriteRepository extends IWriteRepository<PropertyId, PropertyAggregate> {
  /** The property the listing belongs to, if any. */
  findByListingId(listingId: ListingId): Promise<PropertyAggregate | null>;
}
