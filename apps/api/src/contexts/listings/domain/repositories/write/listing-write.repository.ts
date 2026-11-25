import type { IWriteRepository } from '@house-radar/building-blocks';
import type { ListingId } from '@house-radar/shared-kernel';

import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';

export const LISTING_WRITE_REPOSITORY = Symbol('LISTING_WRITE_REPOSITORY');

/**
 * Stores listings. Saving a new aggregate whose (source, external id) already exists updates the stored listing
 * instead of creating another one.
 */
export type IListingWriteRepository = IWriteRepository<ListingId, ListingAggregate>;
