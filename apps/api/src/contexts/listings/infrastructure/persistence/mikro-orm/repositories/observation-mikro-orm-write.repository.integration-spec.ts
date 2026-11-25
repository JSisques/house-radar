import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import { known, ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import type { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import { ObservationBuilder } from '@contexts/listings/domain/builders/observation/observation.builder';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';
import { ListingMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-write.repository';
import { ObservationMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/observation-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

function observation(listingId: ListingId, runId?: RunId, priceEuros?: number): ObservationAggregate {
  const builder = new ObservationBuilder()
    .withListingId(listingId)
    .withObservedAt(new DateValueObject(new Date('2026-11-25T10:00:00.000Z')))
    .withStatus(ListingStatus.active())
    .withSnapshot({ title: 'Piso', rooms: 3 });
  if (runId !== undefined) builder.withRunId(runId);
  if (priceEuros !== undefined) builder.withPrice(known(Money.fromEuros(priceEuros), 'declared'));
  const aggregate = builder.build();
  aggregate.create();
  return aggregate;
}

describe('ObservationMikroOrmWriteRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let repository: ObservationMikroOrmWriteRepository;
  let listingId: ListingId;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(createOrmOptions('listings', postgres.connectionUri));
    repository = new ObservationMikroOrmWriteRepository(orm.em);
  });
  beforeEach(async () => {
    const listing = new ListingBuilder()
      .withSource(new SourceId('manual'))
      .withOriginalUrl(new ListingUrl('https://example.com/piso'))
      .withAddedAt(new DateValueObject(new Date('2026-11-25T09:00:00.000Z')))
      .build();
    await new ListingMikroOrmWriteRepository(orm.em).save(listing);
    listingId = listing.id;
    await pool.query('truncate listings.outbox_event');
  });
  afterEach(async () => {
    await pool.query('truncate listings.observation, listings.listing, listings.outbox_event cascade');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  it('should read back an observation equal to the saved one', async () => {
    const saved = observation(listingId, RunId.generate(), 250000);

    await repository.save(saved);

    expect((await repository.findById(saved.id))?.toPrimitives()).toEqual(saved.toPrimitives());
  });

  it('should keep an observation without run, price or snapshot', async () => {
    const saved = new ObservationBuilder()
      .withListingId(listingId)
      .withObservedAt(new DateValueObject(new Date('2026-11-25T10:00:00.000Z')))
      .build();
    saved.create();

    await repository.save(saved);

    expect((await repository.findById(saved.id))?.toPrimitives()).toEqual(saved.toPrimitives());
  });

  it('should store ListingObservedEvent in the outbox when saved', async () => {
    const saved = observation(listingId, RunId.generate());

    await repository.save(saved);

    const { rows } = await pool.query('select aggregate_type, aggregate_id, event_type from listings.outbox_event');
    expect(rows).toEqual([
      { aggregate_type: 'Observation', aggregate_id: saved.id.value, event_type: 'ListingObservedEvent' },
    ]);
  });

  it('should reject a second observation of the same listing and run', async () => {
    const runId = RunId.generate();
    await repository.save(observation(listingId, runId));

    await expect(repository.save(observation(listingId, runId))).rejects.toThrow();

    const { rows } = await pool.query('select count(*)::int as total from listings.observation');
    expect(rows[0].total).toBe(1);
  });

  it('should accept several observations without run for the same listing', async () => {
    await repository.save(observation(listingId));
    await repository.save(observation(listingId));

    const { rows } = await pool.query('select count(*)::int as total from listings.observation');
    expect(rows[0].total).toBe(2);
  });
});
