import { describe, expect, it } from 'vitest';

import { ListingId } from '@house-radar/shared-kernel';

import { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import { ProjectListingImportedHandler } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.handler';
import { RebuildPropertySearchViewCommand } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.command';
import { RebuildPropertySearchViewHandler } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.handler';
import { createInMemoryProjection } from '@contexts/properties/application/testing/in-memory-projection.testing';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

const LISTING_A = ListingId.generate().value;
const LISTING_B = ListingId.generate().value;
const PROPERTY = 'property-1';

const imported = (
  eventId: string,
  listingId: string,
  attributes: ListingAttributes,
  priceCents: number | null,
  observedAt: string,
  source = 'fotocasa',
) =>
  new ProjectListingImportedCommand({
    eventId,
    listingId,
    source,
    status: 'active',
    priceCents,
    attributes,
    observedAt: new Date(observedAt),
  });

const setup = (propertyOfListing: Record<string, string> = { [LISTING_A]: PROPERTY, [LISTING_B]: PROPERTY }) => {
  const projection = createInMemoryProjection(propertyOfListing);
  const handler = new ProjectListingImportedHandler(
    projection.transactions,
    projection.processedEvents,
    projection.projectedListings,
    projection.refresher,
  );
  return { projection, handler };
};

describe('ProjectListingImportedHandler', () => {
  it('should project the listing into the view of its property', async () => {
    const { projection, handler } = setup();

    await handler.execute(imported('e1', LISTING_A, { builtArea: 100 }, 20_000_000, '2026-11-01T10:00:00Z'));

    expect(projection.views.get(PROPERTY)).toMatchObject({
      builtAreaM2: 100,
      representativePriceCents: 20_000_000,
      pricePerM2Cents: 200_000,
    });
  });

  it('should show the latest built area and list the conflict when two listings disagree (HR-F002-AC7)', async () => {
    const { projection, handler } = setup();

    await handler.execute(imported('e1', LISTING_A, { builtArea: 100 }, 20_000_000, '2026-11-01T10:00:00Z'));
    await handler.execute(
      imported('e2', LISTING_B, { builtArea: 105 }, 19_000_000, '2026-11-02T10:00:00Z', 'idealista'),
    );

    const view = projection.views.get(PROPERTY);
    expect(view?.builtAreaM2).toBe(105);
    expect(view?.representativePriceCents).toBe(19_000_000);
    expect(view?.conflicts['builtArea']).toEqual([
      { listingId: LISTING_A, source: 'fotocasa', value: 100 },
      { listingId: LISTING_B, source: 'idealista', value: 105 },
    ]);
  });

  it('should skip a redelivered event', async () => {
    const { projection, handler } = setup();
    await handler.execute(imported('e1', LISTING_A, { bedrooms: 2 }, 1, '2026-11-01T10:00:00Z'));
    projection.views.clear();

    await handler.execute(imported('e1', LISTING_A, { bedrooms: 2 }, 1, '2026-11-01T10:00:00Z'));

    expect(projection.views.size).toBe(0);
  });

  it('should keep the listing state and write no view while the listing has no property yet', async () => {
    const { projection, handler } = setup({});

    await handler.execute(imported('e1', LISTING_A, { bedrooms: 2 }, 1, '2026-11-01T10:00:00Z'));

    expect(projection.views.size).toBe(0);
    expect(await projection.projectedListings.findByProperty(PROPERTY)).toEqual([]);
  });
});

describe('RebuildPropertySearchViewHandler', () => {
  it('should recompute the view of every property from the stored listing state', async () => {
    const { projection, handler } = setup();
    await handler.execute(imported('e1', LISTING_A, { builtArea: 100 }, 20_000_000, '2026-11-01T10:00:00Z'));
    projection.views.clear();

    await new RebuildPropertySearchViewHandler(
      projection.transactions,
      projection.projectedListings,
      projection.refresher,
    ).execute();

    expect(projection.views.get(PROPERTY)).toMatchObject({ builtAreaM2: 100, listingCount: 1 });
    expect(new RebuildPropertySearchViewCommand()).toBeInstanceOf(RebuildPropertySearchViewCommand);
  });
});
