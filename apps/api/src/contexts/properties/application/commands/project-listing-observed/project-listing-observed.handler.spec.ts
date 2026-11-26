import { describe, expect, it } from 'vitest';

import { ListingId } from '@house-radar/shared-kernel';

import { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import { ProjectListingImportedHandler } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.handler';
import { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import { ProjectListingObservedHandler } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.handler';
import { createInMemoryProjection } from '@contexts/properties/application/testing/in-memory-projection.testing';

const LISTING_A = ListingId.generate().value;
const LISTING_B = ListingId.generate().value;
const PROPERTY = 'property-1';

const observed = (eventId: string, listingId: string, status: string, priceCents: number | null, observedAt: string) =>
  new ProjectListingObservedCommand({ eventId, listingId, status, priceCents, observedAt: new Date(observedAt) });

const setup = () => {
  const projection = createInMemoryProjection({ [LISTING_A]: PROPERTY, [LISTING_B]: PROPERTY });
  const importHandler = new ProjectListingImportedHandler(
    projection.transactions,
    projection.processedEvents,
    projection.projectedListings,
    projection.refresher,
  );
  const observeHandler = new ProjectListingObservedHandler(
    projection.transactions,
    projection.processedEvents,
    projection.projectedListings,
    projection.refresher,
  );
  const importListing = (eventId: string, listingId: string, priceCents: number, attributes = {}) =>
    importHandler.execute(
      new ProjectListingImportedCommand({
        eventId,
        listingId,
        source: 'fotocasa',
        status: 'active',
        priceCents,
        attributes,
        observedAt: new Date('2026-11-01T10:00:00Z'),
      }),
    );
  return { projection, observeHandler, importListing };
};

describe('ProjectListingObservedHandler', () => {
  it('should use the lowest price of two active listings as the representative price (HR-F002-AC8)', async () => {
    const { projection, observeHandler, importListing } = setup();
    await importListing('e1', LISTING_A, 20_000_000);
    await importListing('e2', LISTING_B, 19_500_000);

    await observeHandler.execute(observed('e3', LISTING_B, 'active', 19_000_000, '2026-11-02T10:00:00Z'));

    expect(projection.views.get(PROPERTY)?.representativePriceCents).toBe(19_000_000);
  });

  it('should leave price per m2 unknown for a listing with only the usable area (HR-F002-AC4)', async () => {
    const { projection, observeHandler, importListing } = setup();
    await importListing('e1', LISTING_A, 20_000_000, { usableArea: 90 });

    await observeHandler.execute(observed('e2', LISTING_A, 'active', 20_000_000, '2026-11-02T10:00:00Z'));

    expect(projection.views.get(PROPERTY)).toMatchObject({ usableAreaM2: 90, pricePerM2Cents: null });
  });

  it('should stop counting a disappeared listing toward the price and keep its attributes (HR-F002-AC9)', async () => {
    const { projection, observeHandler, importListing } = setup();
    await importListing('e1', LISTING_A, 20_000_000, { bedrooms: 3 });
    await importListing('e2', LISTING_B, 19_000_000);

    await observeHandler.execute(observed('e3', LISTING_B, 'disappeared', 19_000_000, '2026-11-02T10:00:00Z'));

    expect(projection.views.get(PROPERTY)).toMatchObject({
      representativePriceCents: 20_000_000,
      activeListingCount: 1,
      listingCount: 2,
      bedrooms: 3,
    });
  });

  it('should have no representative price once every listing disappeared', async () => {
    const { projection, observeHandler, importListing } = setup();
    await importListing('e1', LISTING_A, 20_000_000);

    await observeHandler.execute(observed('e2', LISTING_A, 'disappeared', 20_000_000, '2026-11-02T10:00:00Z'));

    expect(projection.views.get(PROPERTY)).toMatchObject({ representativePriceCents: null, listingCount: 1 });
  });

  it('should skip a redelivered event', async () => {
    const { projection, observeHandler, importListing } = setup();
    await importListing('e1', LISTING_A, 20_000_000);
    await observeHandler.execute(observed('e2', LISTING_A, 'disappeared', 20_000_000, '2026-11-02T10:00:00Z'));
    projection.views.clear();

    await observeHandler.execute(observed('e2', LISTING_A, 'disappeared', 20_000_000, '2026-11-02T10:00:00Z'));

    expect(projection.views.size).toBe(0);
  });
});
