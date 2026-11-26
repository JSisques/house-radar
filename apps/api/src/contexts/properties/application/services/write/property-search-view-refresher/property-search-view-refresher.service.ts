import { Inject, Injectable } from '@nestjs/common';

import {
  type IProjectedListingRepository,
  PROJECTED_LISTING_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/projected-listing-repository.port';
import {
  type IPropertySearchViewRepository,
  PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/property-search-view-repository.port';
import { PropertySearchViewConsolidationService } from '@contexts/properties/application/services/write/property-search-view-consolidation/property-search-view-consolidation.service';

/** Recomputes the search view of a property from the state of its listings. */
@Injectable()
export class PropertySearchViewRefresherService {
  constructor(
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN) private readonly views: IPropertySearchViewRepository,
    @Inject(PropertySearchViewConsolidationService)
    private readonly consolidation: PropertySearchViewConsolidationService,
  ) {}

  /** Refreshes the property of the listing; a listing without a property yet has no view to refresh. */
  async refreshPropertyOf(listingId: string): Promise<void> {
    const propertyId = await this.listings.findPropertyIdOf(listingId);
    if (propertyId !== null) await this.refresh(propertyId);
  }

  async refresh(propertyId: string): Promise<void> {
    const listings = await this.listings.findByProperty(propertyId);
    await this.views.save(this.consolidation.consolidate(propertyId, listings));
  }
}
