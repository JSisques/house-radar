import { MikroORM } from '@mikro-orm/postgresql';
import type { CommandBus } from '@nestjs/cqrs';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateUuidV7 } from '@house-radar/building-blocks';
import { OutboxRelay } from '@house-radar/outbox';
import { ListingId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { CreatePropertyFromListingObservedHandler } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.handler';
import { ProjectListingImportedHandler } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.handler';
import { ProjectListingObservedHandler } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.handler';
import { RebuildPropertySearchViewCommand } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.command';
import { RebuildPropertySearchViewHandler } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.handler';
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';
import { PropertyBuilderFactory } from '@contexts/properties/domain/builders/property/property-builder.factory';
import { ListingEventPayloadMapper } from '@contexts/properties/infrastructure/messaging/listing-event-payload/listing-event-payload.mapper';
import { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed/listing-observed.consumer';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import { ProcessedEventMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/processed-event-mikro-orm/processed-event-mikro-orm.repository';
import { ProjectedListingMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/projected-listing-mikro-orm/projected-listing-mikro-orm.repository';
import { PropertyMikroOrmWriteRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-mikro-orm-write/property-mikro-orm-write.repository';
import { PropertySearchViewMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-search-view-mikro-orm/property-search-view-mikro-orm.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';
import { MikroOrmTransactionManager } from '@core/persistence/transaction-manager/mikro-orm-transaction-manager.js';

const known = (value: unknown) => ({ kind: 'known', value, origin: 'declared' });
const UNKNOWN = { kind: 'unknown' };

describe('relay -> consumer -> property_search_view', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let listingsOrm: MikroORM;
  let propertiesOrm: MikroORM;
  let relay: OutboxRelay;
  let commands: CommandBus;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    listingsOrm = await MikroORM.init(createOrmOptions('listings', postgres.connectionUri));
    propertiesOrm = await MikroORM.init(createOrmOptions('properties', postgres.connectionUri));

    const em = propertiesOrm.em;
    const transactions = new MikroOrmTransactionManager(em);
    const processedEvents = new ProcessedEventMikroOrmRepository(em);
    const listings = new ProjectedListingMikroOrmRepository(em);
    const refresher = new PropertySearchViewRefresherService(listings, new PropertySearchViewMikroOrmRepository(em));
    const handlers = [
      new CreatePropertyFromListingObservedHandler(
        transactions,
        processedEvents,
        new PropertyMikroOrmWriteRepository(em, new PropertyRowMapper(new PropertyBuilderFactory())),
        new PropertyBuilderFactory(),
      ),
      new ProjectListingImportedHandler(transactions, processedEvents, listings, refresher),
      new ProjectListingObservedHandler(transactions, processedEvents, listings, refresher),
      new RebuildPropertySearchViewHandler(transactions, listings, refresher),
    ];
    commands = {
      execute: (command: object) => {
        const handler = handlers.find(
          (candidate) => candidate.constructor.name === `${command.constructor.name.replace('Command', '')}Handler`,
        );
        if (handler === undefined) throw new Error(`no handler for ${command.constructor.name}`);
        return (handler as unknown as { execute: (command: object) => Promise<unknown> }).execute(command);
      },
    } as unknown as CommandBus;
    const consumer = new ListingObservedConsumer(commands, new ListingEventPayloadMapper());
    relay = new OutboxRelay(listingsOrm.em, 'listings', (message) => consumer.handle(message));
  });
  afterEach(async () => {
    await pool.query('truncate listings.outbox_event');
    await pool.query('truncate properties.property cascade');
    await pool.query('truncate properties.projected_listing, properties.processed_event, properties.outbox_event');
  });
  afterAll(async () => {
    await listingsOrm.close();
    await propertiesOrm.close();
    await pool.end();
    await postgres.stop();
  });

  async function publish(eventType: string, aggregateType: string, payload: object): Promise<void> {
    await pool.query(
      `insert into listings.outbox_event
         (id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at)
       values ($1, $2, $3, 1, $4, 1, $5, '{}', now())`,
      [generateUuidV7(), aggregateType, generateUuidV7(), eventType, JSON.stringify(payload)],
    );
  }

  const importListing = (
    listingId: string,
    attributes: { builtArea?: unknown; usableArea?: unknown },
    priceCents: number,
    checkedAt: string,
    source = 'fotocasa',
  ) =>
    publish('ListingImportedEvent', 'Listing', {
      id: listingId,
      source,
      status: 'active',
      price: known(priceCents),
      lastCheckedAt: checkedAt,
      builtArea: attributes.builtArea ?? UNKNOWN,
      usableArea: attributes.usableArea ?? UNKNOWN,
      features: { garage: UNKNOWN },
    });

  const observe = (listingId: string, status: string, priceCents: number, observedAt: string) =>
    publish('ListingObservedEvent', 'Observation', {
      id: generateUuidV7(),
      listingId,
      observedAt,
      status,
      price: known(priceCents),
    });

  const viewRows = async () =>
    (
      await pool.query(
        `select built_area_m2::float8 as built_area_m2, usable_area_m2::float8 as usable_area_m2, conflicts,
                representative_price_cents::float8 as representative_price_cents,
                price_per_m2_cents::float8 as price_per_m2_cents, active_listing_count, listing_count
           from properties.property_search_view order by property_id`,
      )
    ).rows;

  it('should project a listing into the view of its property', async () => {
    const listingId = ListingId.generate().value;
    await importListing(listingId, { builtArea: known(100) }, 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'active', 20_000_000, '2026-11-01T10:00:00Z');

    await relay.runOnce();

    expect(await viewRows()).toEqual([
      {
        built_area_m2: 100,
        usable_area_m2: null,
        conflicts: {},
        representative_price_cents: 20_000_000,
        price_per_m2_cents: 200_000,
        active_listing_count: 1,
        listing_count: 1,
      },
    ]);
  });

  it('should leave the price per m2 unknown for a listing with only the usable area (HR-F002-AC4)', async () => {
    const listingId = ListingId.generate().value;
    await importListing(listingId, { usableArea: known(90) }, 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'active', 20_000_000, '2026-11-01T10:00:00Z');

    await relay.runOnce();

    expect(await viewRows()).toMatchObject([{ usable_area_m2: 90, built_area_m2: null, price_per_m2_cents: null }]);
  });

  it('should stop counting a disappeared listing toward the price and keep its state (HR-F002-AC9)', async () => {
    const listingId = ListingId.generate().value;
    await importListing(listingId, { builtArea: known(100) }, 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'active', 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'disappeared', 20_000_000, '2026-11-02T10:00:00Z');

    await relay.runOnce();

    expect(await viewRows()).toMatchObject([
      { representative_price_cents: null, active_listing_count: 0, listing_count: 1, built_area_m2: 100 },
    ]);
    expect((await pool.query('select status from properties.projected_listing')).rows).toEqual([
      { status: 'disappeared' },
    ]);
  });

  it('should ignore a late observation that is older than the state already applied', async () => {
    const listingId = ListingId.generate().value;
    await importListing(listingId, { builtArea: known(100) }, 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'disappeared', 20_000_000, '2026-11-03T10:00:00Z');
    await observe(listingId, 'active', 1, '2026-11-02T10:00:00Z');

    await relay.runOnce();

    expect(await viewRows()).toMatchObject([{ representative_price_cents: null, active_listing_count: 0 }]);
  });

  it('should rebuild the same views from the stored listing state', async () => {
    const listingId = ListingId.generate().value;
    await importListing(listingId, { builtArea: known(100) }, 20_000_000, '2026-11-01T10:00:00Z');
    await observe(listingId, 'active', 20_000_000, '2026-11-01T10:00:00Z');
    await relay.runOnce();
    const before = await viewRows();
    await pool.query('truncate properties.property_search_view');

    await commands.execute(new RebuildPropertySearchViewCommand());

    expect(await viewRows()).toEqual(before);
  });

  it('should show the latest built area and list the conflict when two listings of one property disagree (HR-F002-AC7)', async () => {
    const first = ListingId.generate().value;
    const second = ListingId.generate().value;
    await importListing(first, { builtArea: known(100) }, 20_000_000, '2026-11-01T10:00:00Z');
    await importListing(second, { builtArea: known(105) }, 19_000_000, '2026-11-02T10:00:00Z', 'idealista');
    await observe(first, 'active', 20_000_000, '2026-11-01T10:00:00Z');
    await observe(second, 'active', 19_000_000, '2026-11-02T10:00:00Z');
    await relay.runOnce();
    // Merging properties belongs to HR-F005: until then the link is made by hand, as the merge will do.
    await pool.query(
      `update properties.property_listing set property_id = (select property_id from properties.property_listing where listing_id = $1) where listing_id = $2`,
      [first, second],
    );
    await commands.execute(new RebuildPropertySearchViewCommand());

    const [view] = (
      await pool.query(
        `select built_area_m2::float8 as built_area_m2, conflicts, representative_price_cents::float8 as price
           from properties.property_search_view where listing_count = 2`,
      )
    ).rows;
    expect(view).toEqual({
      built_area_m2: 105,
      price: 19_000_000,
      conflicts: {
        builtArea: [
          { listingId: first, source: 'fotocasa', value: 100 },
          { listingId: second, source: 'idealista', value: 105 },
        ],
      },
    });
  });
});
