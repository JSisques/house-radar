import { Inject, Injectable } from '@nestjs/common';

import { IService } from '@house-radar/building-blocks';

import {
  type IProjectedListingRepository,
  PROJECTED_LISTING_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/projected-listing-repository.port';
import {
  type IPropertySearchViewRepository,
  PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/property-search-view-repository.port';
import { PropertySearchViewConsolidationService } from '@contexts/properties/application/services/write/property-search-view-consolidation/property-search-view-consolidation.service';

export interface IRefreshPropertySearchViewServiceInput {
  propertyId: string;
}

/** Recomputes the search view of a property from the state of its listings. */
@Injectable()
export class RefreshPropertySearchViewService implements IService<IRefreshPropertySearchViewServiceInput, void> {
  constructor(
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN) private readonly views: IPropertySearchViewRepository,
    @Inject(PropertySearchViewConsolidationService)
    private readonly consolidation: PropertySearchViewConsolidationService,
  ) {}

  async execute({ propertyId }: IRefreshPropertySearchViewServiceInput): Promise<void> {
    const listings = await this.listings.findByProperty(propertyId);
    await this.views.save(this.consolidation.execute({ propertyId, listings }));
  }
}
