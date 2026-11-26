import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';

/** One listing's value of an attribute that listings disagree on, with where it comes from. */
export interface IAttributeConflictValueViewModel {
  listingId: string;
  source: string | null;
  value: ListingAttributeValue;
}
