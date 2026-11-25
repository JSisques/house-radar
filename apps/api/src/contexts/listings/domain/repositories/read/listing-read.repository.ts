import type { IReadRepository } from '@house-radar/building-blocks';
import type { ListingId } from '@house-radar/shared-kernel';

import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';

export const LISTING_READ_REPOSITORY = Symbol('LISTING_READ_REPOSITORY');

/** Reads listings as primitives. Filterable and sortable fields: source, externalId, status, addedAt, lastCheckedAt. */
export type IListingReadRepository = IReadRepository<ListingId, IListingPrimitives>;
