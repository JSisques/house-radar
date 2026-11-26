import type { ListingId } from '@house-radar/shared-kernel';

/** A listing that belongs to a property, with the newest aggregate version of it that was applied. */
export interface IListingReferenceProps {
  listingId: ListingId;
  version: number;
}
