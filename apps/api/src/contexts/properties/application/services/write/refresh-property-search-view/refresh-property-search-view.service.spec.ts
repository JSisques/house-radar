import { describe, expect, it, vi } from 'vitest';

import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { IPropertySearchViewRepository } from '@contexts/properties/application/ports/property-search-view-repository.port';
import { PricePerSquareMeterCalculationService } from '@contexts/properties/application/services/write/price-per-square-meter-calculation/price-per-square-meter-calculation.service';
import { PropertySearchViewConsolidationService } from '@contexts/properties/application/services/write/property-search-view-consolidation/property-search-view-consolidation.service';
import { RefreshPropertySearchViewService } from '@contexts/properties/application/services/write/refresh-property-search-view/refresh-property-search-view.service';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

const LISTING: IProjectedListingProps = {
  listingId: 'listing-1',
  source: 'fotocasa',
  status: 'active',
  priceCents: 20_000_000,
  attributes: { builtArea: 100 },
  attributesObservedAt: new Date('2026-11-01T10:00:00Z'),
};

const setup = () => {
  const listings = {
    findByProperty: vi.fn(() => Promise.resolve([LISTING])),
  } as unknown as IProjectedListingRepository;
  const views: IPropertySearchViewRepository = { save: vi.fn(() => Promise.resolve()) };
  return {
    service: new RefreshPropertySearchViewService(
      listings,
      views,
      new PropertySearchViewConsolidationService(new PricePerSquareMeterCalculationService()),
    ),
    listings,
    views,
  };
};

describe('RefreshPropertySearchViewService', () => {
  describe('execute', () => {
    it('should save the view consolidated from the listings of the property', async () => {
      const { service, views } = setup();

      await service.execute({ propertyId: 'property-1' });

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
});
