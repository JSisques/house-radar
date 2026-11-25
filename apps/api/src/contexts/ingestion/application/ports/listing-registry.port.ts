import type { DateValueObject } from '@house-radar/building-blocks';
import type { ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

export const LISTING_REGISTRY_PORT = Symbol('LISTING_REGISTRY_PORT');

/** Optional descriptive data the user knows; whatever is absent stays unknown (D17). Plain values: `listings` validates them. */
export interface IManualListingDetails {
  title?: string;
  description?: string;
  /** Square meters. */
  builtArea?: number;
  usableArea?: number;
  plotArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  propertyType?: string;
  condition?: string;
  features?: IManualListingFeatures;
}

export interface IManualListingFeatures {
  garage?: boolean;
  garden?: boolean;
  swimmingPool?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  heating?: boolean;
  elevator?: boolean;
  energyCertificate?: string;
  landType?: string;
  water?: boolean;
  electricity?: boolean;
  sanitation?: boolean;
}

export interface IRegisterManualListingInput {
  source: SourceId;
  /** Already normalized; kept as provenance and never fetched. */
  url: ListingUrl;
  price: Money;
  observedAt: DateValueObject;
  details: IManualListingDetails;
}

/** Cross-context port to `listings`. Its adapter is the only place that may import that context. */
export interface IListingRegistryPort {
  /** The manual listing already stored for this normalized URL, if any. */
  findManualByNormalizedUrl(url: ListingUrl): Promise<ListingId | null>;
  /** Creates the listing and its first observation. */
  registerManual(input: IRegisterManualListingInput): Promise<ListingId>;
}
