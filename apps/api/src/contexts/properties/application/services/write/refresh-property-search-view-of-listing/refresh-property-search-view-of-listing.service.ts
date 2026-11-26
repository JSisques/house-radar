import { Inject, Injectable } from '@nestjs/common';

import { IService } from '@house-radar/building-blocks';

import {
  type IProjectedListingRepository,
  PROJECTED_LISTING_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/projected-listing-repository.port';
import { RefreshPropertySearchViewService } from '@contexts/properties/application/services/write/refresh-property-search-view/refresh-property-search-view.service';

export interface IRefreshPropertySearchViewOfListingServiceInput {
  listingId: string;
}

/** Finds the property of the listing and refreshes its search view; does nothing while the listing has no property yet. */
@Injectable()
export class RefreshPropertySearchViewOfListingService implements IService<
  IRefreshPropertySearchViewOfListingServiceInput,
  void
> {
  constructor(
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(RefreshPropertySearchViewService) private readonly refresher: RefreshPropertySearchViewService,
  ) {}

  async execute({ listingId }: IRefreshPropertySearchViewOfListingServiceInput): Promise<void> {
    const propertyId = await this.listings.findPropertyIdOf(listingId);
    if (propertyId !== null) await this.refresher.execute({ propertyId });
  }
}
