import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';

/** A value one listing observed for an attribute. */
export interface IAttributeObservation {
  listingId: string;
  source: string | null;
  value: ListingAttributeValue;
}
