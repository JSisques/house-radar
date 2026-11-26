import { describe, expect, it, vi } from 'vitest';

import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { IPropertySearchViewRepository } from '@contexts/properties/application/ports/property-search-view-repository.port';
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

const LISTING: IProjectedListingProps = {
  listingId: 'listing-1',
  source: 'fotocasa',
  status: 'active',
  priceCents: 20_000_000,
  attributes: { builtArea: 100 },
  attributesObservedAt: new Date('2026-11-01T10:00:00Z'),
};

const setup = (propertyId: string | null) => {
  const listings = {
    findPropertyIdOf: vi.fn(() => Promise.resolve(propertyId)),
    findByProperty: vi.fn(() => Promise.resolve([LISTING])),
  } as unknown as IProjectedListingRepository;
  const views: IPropertySearchViewRepository = { save: vi.fn(() => Promise.resolve()) };
  return { service: new PropertySearchViewRefresherService(listings, views), listings, views };
};

describe('PropertySearchViewRefresherService', () => {
  describe('refresh', () => {
    it('should save the view consolidated from the listings of the property', async () => {
      const { service, views } = setup('property-1');

      await service.refresh('property-1');

      expect(views.save).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'property-1',
          builtAreaM2: 100,
          representativePriceCents: 20_000_000,
          pricePerM2Cents: 200_000,
        }),
      );
    });
  });

  describe('refreshPropertyOf', () => {
    it('should refresh the property that owns the listing', async () => {
      const { service, listings, views } = setup('property-1');

      await service.refreshPropertyOf('listing-1');

      expect(listings.findPropertyIdOf).toHaveBeenCalledWith('listing-1');
      expect(views.save).toHaveBeenCalledWith(expect.objectContaining({ propertyId: 'property-1' }));
    });

    it('should save nothing while the listing has no property yet', async () => {
      const { service, views } = setup(null);

      await service.refreshPropertyOf('listing-1');

      expect(views.save).not.toHaveBeenCalled();
    });
  });
});
