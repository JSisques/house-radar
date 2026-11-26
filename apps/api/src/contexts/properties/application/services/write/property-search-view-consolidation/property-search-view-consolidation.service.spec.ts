import { describe, expect, it } from 'vitest';

import { PricePerSquareMeterCalculationService } from '@contexts/properties/application/services/write/price-per-square-meter-calculation/price-per-square-meter-calculation.service';
import { PropertySearchViewConsolidationService } from '@contexts/properties/application/services/write/property-search-view-consolidation/property-search-view-consolidation.service';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

const PROPERTY_ID = 'property-1';

const listing = (overrides: Partial<IProjectedListingProps> & { listingId: string }): IProjectedListingProps => ({
  source: 'fotocasa',
  status: 'active',
  priceCents: null,
  attributes: {},
  attributesObservedAt: new Date('2026-11-01T10:00:00Z'),
  ...overrides,
});

const attrs = (values: ListingAttributes): ListingAttributes => values;

describe('PropertySearchViewConsolidationService', () => {
  const service = new PropertySearchViewConsolidationService(new PricePerSquareMeterCalculationService());

  describe('consolidate', () => {
    it('should be the lowest price among the active listings', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000 }),
        listing({ listingId: 'b', priceCents: 19_000_000 }),
      ]);

      expect(view.representativePriceCents).toBe(19_000_000);
      expect(view.activeListingCount).toBe(2);
      expect(view.listingCount).toBe(2);
    });

    it('should ignore listings that are not active, keeping them in the listing count (HR-F002-AC9)', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000 }),
        listing({ listingId: 'b', priceCents: 15_000_000, status: 'disappeared' }),
      ]);

      expect(view.representativePriceCents).toBe(20_000_000);
      expect(view.activeListingCount).toBe(1);
      expect(view.listingCount).toBe(2);
    });

    it('should be unknown when no listing is active', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000, status: 'disappeared' }),
      ]);

      expect(view.representativePriceCents).toBeNull();
    });

    it('should ignore an active listing with an unknown price', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: null }),
        listing({ listingId: 'b', priceCents: 19_000_000 }),
      ]);

      expect(view.representativePriceCents).toBe(19_000_000);
    });

    it('should not count a listing that was never observed', () => {
      const view = service.consolidate(PROPERTY_ID, [listing({ listingId: 'a', status: null, priceCents: 1 })]);

      expect(view.representativePriceCents).toBeNull();
      expect(view.activeListingCount).toBe(0);
    });

    it('should divide the representative price by the built area', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000, attributes: attrs({ builtArea: 100 }) }),
      ]);

      expect(view.pricePerM2Cents).toBe(200_000);
    });

    it('should be unknown with only the usable area', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000, attributes: attrs({ usableArea: 90 }) }),
      ]);

      expect(view.usableAreaM2).toBe(90);
      expect(view.pricePerM2Cents).toBeNull();
    });

    it('should be unknown without a representative price', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: null, attributes: attrs({ builtArea: 100 }) }),
      ]);

      expect(view.pricePerM2Cents).toBeNull();
    });

    it('should use the consolidated built area', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', priceCents: 20_000_000, attributes: attrs({ builtArea: 100 }) }),
        listing({
          listingId: 'b',
          priceCents: 19_000_000,
          attributes: attrs({ builtArea: 95 }),
          attributesObservedAt: new Date('2026-11-02T10:00:00Z'),
        }),
      ]);

      expect(view.pricePerM2Cents).toBe(200_000);
    });

    it('should show the value of the most recently observed listing and list the conflict with its sources', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({
          listingId: 'a',
          source: 'fotocasa',
          attributes: attrs({ builtArea: 100 }),
          attributesObservedAt: new Date('2026-11-01T10:00:00Z'),
        }),
        listing({
          listingId: 'b',
          source: 'idealista',
          attributes: attrs({ builtArea: 105 }),
          attributesObservedAt: new Date('2026-11-02T10:00:00Z'),
        }),
      ]);

      expect(view.builtAreaM2).toBe(105);
      expect(view.conflicts).toEqual({
        builtArea: [
          { listingId: 'a', source: 'fotocasa', value: 100 },
          { listingId: 'b', source: 'idealista', value: 105 },
        ],
      });
    });

    it('should not flag a conflict when the listings agree', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', attributes: attrs({ bedrooms: 3 }) }),
        listing({ listingId: 'b', attributes: attrs({ bedrooms: 3 }) }),
      ]);

      expect(view.bedrooms).toBe(3);
      expect(view.conflicts).toEqual({});
    });

    it('should not turn an unknown value into a conflict or hide a known one', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', attributes: attrs({ yearBuilt: 1990 }) }),
        listing({
          listingId: 'b',
          attributes: attrs({}),
          attributesObservedAt: new Date('2026-11-02T10:00:00Z'),
        }),
      ]);

      expect(view.yearBuilt).toBe(1990);
      expect(view.conflicts).toEqual({});
    });

    it('should leave an attribute unknown when no listing states it', () => {
      const view = service.consolidate(PROPERTY_ID, [listing({ listingId: 'a', attributes: attrs({}) })]);

      expect(view).toMatchObject({
        title: null,
        description: null,
        propertyType: null,
        condition: null,
        builtAreaM2: null,
        usableAreaM2: null,
        plotAreaM2: null,
        bedrooms: null,
        bathrooms: null,
        yearBuilt: null,
        features: {},
      });
    });

    it('should break a tie between observation times by the listing id', () => {
      const observedAt = new Date('2026-11-01T10:00:00Z');
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'b', attributes: attrs({ bedrooms: 4 }), attributesObservedAt: observedAt }),
        listing({ listingId: 'a', attributes: attrs({ bedrooms: 3 }), attributesObservedAt: observedAt }),
      ]);

      expect(view.bedrooms).toBe(4);
    });

    it('should consolidate and flag conflicts in additional features', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', attributes: attrs({ garage: true, elevator: true }) }),
        listing({
          listingId: 'b',
          attributes: attrs({ garage: false }),
          attributesObservedAt: new Date('2026-11-02T10:00:00Z'),
        }),
      ]);

      expect(view.features).toEqual({ garage: false, elevator: true });
      expect(view.conflicts).toHaveProperty('garage');
    });

    it('should skip listings whose attributes have not arrived yet', () => {
      const view = service.consolidate(PROPERTY_ID, [
        listing({ listingId: 'a', source: null, attributes: null, attributesObservedAt: null, priceCents: 5 }),
        listing({ listingId: 'b', attributes: attrs({ title: 'Piso' }) }),
      ]);

      expect(view.title).toBe('Piso');
    });
  });
});
