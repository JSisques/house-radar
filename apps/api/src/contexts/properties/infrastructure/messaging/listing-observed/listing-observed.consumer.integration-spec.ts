import { MikroORM } from '@mikro-orm/postgresql';
import type { CommandBus } from '@nestjs/cqrs';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateUuidV7 } from '@house-radar/building-blocks';
import { OutboxRelay } from '@house-radar/outbox';
import { ListingId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { CreatePropertyFromListingObservedHandler } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.handler';
import { PropertyBuilderFactory } from '@contexts/properties/domain/builders/property/property-builder.factory';
import { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed/listing-observed.consumer';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import { ProcessedEventMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/processed-event-mikro-orm/processed-event-mikro-orm.repository';
import { PropertyMikroOrmWriteRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-mikro-orm-write/property-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';
import { MikroOrmTransactionManager } from '@core/persistence/transaction-manager/mikro-orm-transaction-manager.js';

describe('relay -> ListingObservedConsumer -> properties tables', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let listingsOrm: MikroORM;
  let propertiesOrm: MikroORM;
  let relay: OutboxRelay;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    listingsOrm = await MikroORM.init(createOrmOptions('listings', postgres.connectionUri));
    propertiesOrm = await MikroORM.init(createOrmOptions('properties', postgres.connectionUri));

    const handler = new CreatePropertyFromListingObservedHandler(
      new MikroOrmTransactionManager(propertiesOrm.em),
      new ProcessedEventMikroOrmRepository(propertiesOrm.em),
      new PropertyMikroOrmWriteRepository(propertiesOrm.em, new PropertyRowMapper(new PropertyBuilderFactory())),
      new PropertyBuilderFactory(),
    );
    const commands = { execute: (command: never) => handler.execute(command) } as unknown as CommandBus;
    const consumer = new ListingObservedConsumer(commands);
    relay = new OutboxRelay(listingsOrm.em, 'listings', (message) => consumer.handle(message));
  });
  afterEach(async () => {
    await pool.query('truncate listings.outbox_event');
    await pool.query('truncate properties.property cascade');
    await pool.query('truncate properties.processed_event, properties.outbox_event');
  });
  afterAll(async () => {
    await listingsOrm.close();
    await propertiesOrm.close();
    await pool.end();
    await postgres.stop();
  });

  async function publishListingEvent(
    eventType: string,
    listingId: string,
    eventId = generateUuidV7(),
  ): Promise<string> {
    await pool.query(
      `insert into listings.outbox_event
         (id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at)
       values ($1, 'Observation', $2, 1, $3, 1, $4, '{}', now())`,
      [
        eventId,
        generateUuidV7(),
        eventType,
        JSON.stringify({
          listingId,
          status: 'active',
          observedAt: '2026-11-01T10:00:00.000Z',
          price: { kind: 'unknown' },
        }),
      ],
    );
    return eventId;
  }

  const count = async (table: string): Promise<number> =>
    (await pool.query(`select count(*)::int as total from ${table}`)).rows[0].total as number;

  it('creates the property when the relay publishes an unpublished ListingObserved', async () => {
    const listingId = ListingId.generate().value;
    await publishListingEvent('ListingObservedEvent', listingId);

    await relay.runOnce();

    const { rows } = await pool.query('select listing_id, applied_version from properties.property_listing');
    expect(rows).toEqual([{ listing_id: listingId, applied_version: 1 }]);
    expect(await count('properties.property')).toBe(1);
    expect(await count('properties.processed_event')).toBe(1);
    expect(await count('properties.outbox_event')).toBe(1);
    expect((await pool.query('select published_at from listings.outbox_event')).rows[0].published_at).not.toBeNull();
  });

  it('creates no second property when a processed event is replayed', async () => {
    const listingId = ListingId.generate().value;
    const eventId = await publishListingEvent('ListingObservedEvent', listingId);
    await relay.runOnce();

    await pool.query('update listings.outbox_event set published_at = null where id = $1', [eventId]);
    await relay.runOnce();

    expect(await count('properties.property')).toBe(1);
    expect(await count('properties.property_listing')).toBe(1);
    expect(await count('properties.processed_event')).toBe(1);
    expect(await count('properties.outbox_event')).toBe(1);
  });

  it('creates no second property for a new event of a listing that already has one', async () => {
    const listingId = ListingId.generate().value;
    await publishListingEvent('ListingObservedEvent', listingId);
    await publishListingEvent('ListingObservedEvent', listingId);

    await relay.runOnce();

    expect(await count('properties.property')).toBe(1);
  });

  it('skips events that are not ListingObserved', async () => {
    await publishListingEvent('ListingCreatedEvent', ListingId.generate().value);

    await relay.runOnce();

    expect(await count('properties.property')).toBe(0);
    expect(await count('properties.processed_event')).toBe(0);
  });
});
