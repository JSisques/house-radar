import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';

/** Attributes of a listing by name; the names are those of the listing primitives, with the features flattened. */
export type ListingAttributes = Readonly<Record<string, ListingAttributeValue>>;
