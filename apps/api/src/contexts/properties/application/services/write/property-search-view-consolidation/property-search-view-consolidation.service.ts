import { Inject, Injectable } from '@nestjs/common';

import { asNumber, asString } from '@house-radar/building-blocks';
import { ADDITIONAL_FEATURE_NAMES } from '@house-radar/shared-kernel';

import { PricePerSquareMeterCalculationService } from '@contexts/properties/application/services/write/price-per-square-meter-calculation/price-per-square-meter-calculation.service';
import type { IAttributeConflictValueViewModel } from '@contexts/properties/application/view-models/attribute-conflict-value/attribute-conflict-value.view-model';
import type { IPropertySearchViewModel } from '@contexts/properties/application/view-models/property-search-view/property-search-view.view-model';
import { ACTIVE_LISTING_STATUS } from '@contexts/properties/domain/constants/active-listing-status/active-listing-status.constant';
import type { IAttributeObservation } from '@contexts/properties/domain/interfaces/attribute-observation.interface';
import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

/**
 * Consolidates the listings of one property into its read model. It holds the rules of D19 and D20, so a rebuild
 * only has to feed it the stored listing state again.
 */
@Injectable()
export class PropertySearchViewConsolidationService {
  constructor(
    @Inject(PricePerSquareMeterCalculationService)
    private readonly pricePerSquareMeter: PricePerSquareMeterCalculationService,
  ) {}

  consolidate(propertyId: string, listings: readonly IProjectedListingProps[]): IPropertySearchViewModel {
    const observations = this.observationsByAttribute(listings);
    const chosen = (name: string): ListingAttributeValue | undefined => observations.get(name)?.at(-1)?.value;

    const features: Record<string, ListingAttributeValue> = {};
    for (const name of ADDITIONAL_FEATURE_NAMES) {
      const value = chosen(name);
      if (value !== undefined) features[name] = value;
    }

    const activePrices = listings
      .filter((listing) => listing.status === ACTIVE_LISTING_STATUS && listing.priceCents !== null)
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
      pricePerM2Cents: this.pricePerSquareMeter.calculate(representativePriceCents, builtAreaM2),
      activeListingCount: listings.filter((listing) => listing.status === ACTIVE_LISTING_STATUS).length,
      listingCount: listings.length,
    };
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
  ): Record<string, IAttributeConflictValueViewModel[]> {
    const conflicts: Record<string, IAttributeConflictValueViewModel[]> = {};
    for (const [name, values] of observations) {
      if (new Set(values.map((observation) => observation.value)).size > 1) conflicts[name] = values;
    }
    return conflicts;
  }
}
