import { describe, expect, it, vi } from 'vitest';

import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import { RefreshPropertySearchViewService } from '@contexts/properties/application/services/write/refresh-property-search-view/refresh-property-search-view.service';
import { RefreshPropertySearchViewOfListingService } from '@contexts/properties/application/services/write/refresh-property-search-view-of-listing/refresh-property-search-view-of-listing.service';

const setup = (propertyId: string | null) => {
  const listings = {
    findPropertyIdOf: vi.fn(() => Promise.resolve(propertyId)),
  } as unknown as IProjectedListingRepository;
  const refresher = {
    execute: vi.fn(() => Promise.resolve()),
  } as unknown as RefreshPropertySearchViewService;
  return {
    service: new RefreshPropertySearchViewOfListingService(listings, refresher),
    listings,
    refresher,
  };
};

describe('RefreshPropertySearchViewOfListingService', () => {
  describe('execute', () => {
    it('should find the property of the listing and refresh its view', async () => {
      const { service, listings, refresher } = setup('property-1');

      await service.execute({ listingId: 'listing-1' });

      expect(listings.findPropertyIdOf).toHaveBeenCalledWith('listing-1');
      expect(refresher.execute).toHaveBeenCalledWith({ propertyId: 'property-1' });
    });

    it('should do nothing while the listing has no property yet', async () => {
      const { service, refresher } = setup(null);

      await service.execute({ listingId: 'listing-1' });

      expect(refresher.execute).not.toHaveBeenCalled();
    });
  });
});
