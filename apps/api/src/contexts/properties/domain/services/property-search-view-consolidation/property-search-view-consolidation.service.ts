import type {
  IProjectedListingProps,
  ListingAttributes,
  ListingAttributeValue,
} from '@contexts/properties/domain/interfaces/projected-listing-props.interface';
import type {
  IAttributeConflictValuePrimitives,
  IPropertySearchViewPrimitives,
} from '@contexts/properties/domain/primitives/property-search-view.primitives';

/** Additional features of HR-F002-BR3: they are kept apart from the general fields in the view. */
export const ADDITIONAL_FEATURE_NAMES = [
  'garage',
  'garden',
  'swimmingPool',
  'terrace',
  'balcony',
  'heating',
  'elevator',
  'energyCertificate',
  'landType',
  'water',
  'electricity',
  'sanitation',
] as const;

const ACTIVE_STATUS = 'active';

interface IAttributeObservation {
  listingId: string;
  source: string | null;
  value: ListingAttributeValue;
}

const asString = (value: ListingAttributeValue | undefined): string | null =>
  typeof value === 'string' ? value : null;

const asNumber = (value: ListingAttributeValue | undefined): number | null =>
  typeof value === 'number' ? value : null;

/**
 * Consolidates the listings of one property into its read model. Pure: it holds the rules of D19 and D20, so a rebuild
 * only has to feed it the stored listing state again.
 */
export class PropertySearchViewConsolidationService {
  consolidate(propertyId: string, listings: readonly IProjectedListingProps[]): IPropertySearchViewPrimitives {
    const observations = this.observationsByAttribute(listings);
    const chosen = (name: string): ListingAttributeValue | undefined => observations.get(name)?.at(-1)?.value;

    const features: Record<string, ListingAttributeValue> = {};
    for (const name of ADDITIONAL_FEATURE_NAMES) {
      const value = chosen(name);
      if (value !== undefined) features[name] = value;
    }

    const activePrices = listings
      .filter((listing) => listing.status === ACTIVE_STATUS && listing.priceCents !== null)
      .map((listing) => listing.priceCents as number);
    const representativePriceCents = activePrices.length === 0 ? null : Math.min(...activePrices);
    const builtAreaM2 = asNumber(chosen('builtArea'));

    return {
      propertyId,
      title: asString(chosen('title')),
      description: asString(chosen('description')),
      propertyType: asString(chosen('propertyType')),
      condition: asString(chosen('condition')),
      builtAreaM2,
      usableAreaM2: asNumber(chosen('usableArea')),
      plotAreaM2: asNumber(chosen('plotArea')),
      bedrooms: asNumber(chosen('bedrooms')),
      bathrooms: asNumber(chosen('bathrooms')),
      yearBuilt: asNumber(chosen('yearBuilt')),
      features,
      conflicts: this.conflicts(observations),
      representativePriceCents,
      pricePerM2Cents: this.pricePerM2(representativePriceCents, builtAreaM2),
      activeListingCount: listings.filter((listing) => listing.status === ACTIVE_STATUS).length,
      listingCount: listings.length,
    };
  }

  /** D20: the price per m2 uses the built area only; without it, or without a price, it is unknown. */
  private pricePerM2(priceCents: number | null, builtAreaM2: number | null): number | null {
    if (priceCents === null || builtAreaM2 === null || builtAreaM2 <= 0) return null;
    return Math.round(priceCents / builtAreaM2);
  }

  /**
   * Known values by attribute name, from the oldest observation to the newest: the last one is the value to show.
   * Equal observation times are ordered by listing id so the result never depends on the order of the input.
   */
  private observationsByAttribute(listings: readonly IProjectedListingProps[]): Map<string, IAttributeObservation[]> {
    const withAttributes = listings
      .filter((listing): listing is IProjectedListingProps & { attributes: ListingAttributes } => {
        return listing.attributes !== null;
      })
      .sort(
        (a, b) =>
          (a.attributesObservedAt?.getTime() ?? 0) - (b.attributesObservedAt?.getTime() ?? 0) ||
          a.listingId.localeCompare(b.listingId),
      );

    const byAttribute = new Map<string, IAttributeObservation[]>();
    for (const listing of withAttributes) {
      for (const [name, value] of Object.entries(listing.attributes)) {
        const observations = byAttribute.get(name) ?? [];
        observations.push({ listingId: listing.listingId, source: listing.source, value });
        byAttribute.set(name, observations);
      }
    }
    return byAttribute;
  }

  private conflicts(
    observations: Map<string, IAttributeObservation[]>,
  ): Record<string, IAttributeConflictValuePrimitives[]> {
    const conflicts: Record<string, IAttributeConflictValuePrimitives[]> = {};
    for (const [name, values] of observations) {
      if (new Set(values.map((observation) => observation.value)).size > 1) conflicts[name] = values;
    }
    return conflicts;
  }
}
