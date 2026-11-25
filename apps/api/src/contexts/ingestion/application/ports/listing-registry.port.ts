import type { DateValueObject } from '@house-radar/building-blocks';
import type { ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

export const LISTING_REGISTRY_PORT = Symbol('LISTING_REGISTRY_PORT');

export interface IRegisterManualListingInput {
  source: SourceId;
  /** Already normalized; kept as provenance and never fetched. */
  url: ListingUrl;
  price: Money;
  observedAt: DateValueObject;
}

/** Cross-context port to `listings`. Its adapter is the only place that may import that context. */
export interface IListingRegistryPort {
  /** The manual listing already stored for this normalized URL, if any. */
  findManualByNormalizedUrl(url: ListingUrl): Promise<ListingId | null>;
  /** Creates the listing and its first observation. */
  registerManual(input: IRegisterManualListingInput): Promise<ListingId>;
}
