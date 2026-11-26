import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';

/** What the projection knows about one listing: its attributes, its price and its status. */
export interface IProjectedListingProps {
  listingId: string;
  /** Null until the listing attributes arrive (`ListingImported`). */
  source: string | null;
  /** Null until the listing is observed. */
  status: string | null;
  /** Euro cents; null when the price is unknown. */
  priceCents: number | null;
  /** Null until the listing attributes arrive. */
  attributes: ListingAttributes | null;
  /** When the attributes were observed; orders the listings of one property from oldest to newest. */
  attributesObservedAt: Date | null;
}
