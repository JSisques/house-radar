import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

/** One listing's value of an attribute that listings disagree on, with where it comes from. */
export interface IAttributeConflictValuePrimitives {
  listingId: string;
  source: string | null;
  value: ListingAttributeValue;
}

/** The consolidated read model of one property (D19, D20). Unknown values are null. */
export interface IPropertySearchViewPrimitives {
  propertyId: string;
  title: string | null;
  description: string | null;
  propertyType: string | null;
  condition: string | null;
  builtAreaM2: number | null;
  usableAreaM2: number | null;
  plotAreaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  /** Additional features by name (garage, garden, ...); unknown ones are absent. */
  features: Readonly<Record<string, ListingAttributeValue>>;
  /** Attributes with more than one distinct known value, by attribute name. */
  conflicts: Readonly<Record<string, readonly IAttributeConflictValuePrimitives[]>>;
  /** Euro cents: the lowest price among the active listings; null with none. */
  representativePriceCents: number | null;
  /** Euro cents per m2, from the built area only (D20); null when it is unknown. */
  pricePerM2Cents: number | null;
  activeListingCount: number;
  listingCount: number;
}
