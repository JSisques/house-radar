/** A known attribute value. An unknown attribute is simply absent: nobody stated it (HR-F002-BR4). */
export type ListingAttributeValue = string | number | boolean;

/** Attributes of a listing by name; the names are those of `IListingPrimitives` (features flattened). */
export type ListingAttributes = Readonly<Record<string, ListingAttributeValue>>;

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
