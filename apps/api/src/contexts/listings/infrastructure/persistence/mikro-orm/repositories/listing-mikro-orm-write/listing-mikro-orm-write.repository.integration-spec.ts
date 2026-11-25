import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import {
  Area,
  EnergyCertificate,
  ExternalId,
  known,
  ListingId,
  ListingUrl,
  Money,
  PropertyCondition,
  PropertyType,
  SourceId,
} from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import { ListingBuilderFactory } from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';
import { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';
import { ListingRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/listing-row/listing-row.mapper';
import { ListingMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-write/listing-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { OptimisticLockException } from '@core/persistence/optimistic-lock/optimistic-lock.exception.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

const addedAt = new DateValueObject(new Date('2026-11-25T10:00:00.000Z'));

function fullListing(overrides: { externalId?: string; price?: number; title?: string } = {}): ListingAggregate {
  const builder = new ListingBuilder()
    .withSource(new SourceId('idealista'))
    .withOriginalUrl(new ListingUrl('https://www.idealista.com/inmueble/123/?utm=x'))
    .withAddedAt(addedAt)
    .withLastCheckedAt(new DateValueObject(new Date('2026-11-26T08:30:00.000Z')))
    .withStatus(ListingStatus.active())
    .withTitle(known(new ListingTitle(overrides.title ?? 'Piso luminoso'), 'declared'))
    .withDescription(known(new ListingDescription('Reformado'), 'declared'))
    .withPrice(known(Money.fromEuros(overrides.price ?? 250000), 'declared'))
    .withBuiltArea(known(new Area(92.5), 'declared'))
    .withUsableArea(known(new Area(80), 'calculated'))
    .withBedrooms(known(new Bedrooms(3), 'declared'))
    .withBathrooms(known(new Bathrooms(2), 'inferred'))
    .withYearBuilt(known(new YearBuilt(1998), 'declared'))
    .withPropertyType(known(new PropertyType('flat'), 'declared'))
    .withCondition(known(new PropertyCondition('good_condition'), 'declared'))
    .withFeatures(
      new AdditionalFeatures({
        garage: known(true, 'declared'),
        terrace: known(false, 'inferred'),
        energyCertificate: known(new EnergyCertificate('C'), 'declared'),
        landType: known(new LandType('urban'), 'declared'),
        water: known(true, 'declared'),
      }),
    );
  if (overrides.externalId !== undefined) builder.withExternalId(new ExternalId(overrides.externalId));
  const listing = builder.build();
  listing.create();
  return listing;
}

const listingMapper = new ListingRowMapper(new ListingBuilderFactory());

describe('ListingMikroOrmWriteRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let repository: ListingMikroOrmWriteRepository;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(createOrmOptions('listings', postgres.connectionUri));
    repository = new ListingMikroOrmWriteRepository(orm.em, listingMapper);
  });
  afterEach(async () => {
    await pool.query('truncate listings.observation, listings.listing, listings.outbox_event');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  async function count(table: string): Promise<number> {
    const { rows } = await pool.query(`select count(*)::int as total from listings.${table}`);
    return rows[0].total;
  }

  it('should read back an aggregate equal to the saved one', async () => {
    const listing = fullListing({ externalId: '123' });

    await repository.save(listing);
    const loaded = await repository.findById(listing.id);

    expect(loaded?.toPrimitives()).toEqual(listing.toPrimitives());
    expect(loaded?.version).toBe(1);
  });

  it('should keep a minimal listing without external id and with every optional field unknown', async () => {
    const listing = new ListingBuilder()
      .withSource(new SourceId('manual'))
      .withOriginalUrl(new ListingUrl('https://example.com/piso'))
      .withAddedAt(addedAt)
      .build();

    await repository.save(listing);

    expect((await repository.findById(listing.id))?.toPrimitives()).toEqual(listing.toPrimitives());
  });

  it('should store the normalized url in both url columns', async () => {
    const listing = fullListing({ externalId: '123' });

    await repository.save(listing);

    const { rows } = await pool.query('select url, normalized_url from listings.listing');
    expect(rows).toEqual([
      { url: 'https://www.idealista.com/inmueble/123/', normalized_url: 'https://www.idealista.com/inmueble/123/' },
    ]);
  });

  it('should store the listing event in the outbox', async () => {
    const listing = fullListing({ externalId: '123' });

    await repository.save(listing);

    const { rows } = await pool.query(
      'select aggregate_type, aggregate_id, aggregate_version, event_type from listings.outbox_event',
    );
    expect(rows).toEqual([
      {
        aggregate_type: 'Listing',
        aggregate_id: listing.id.value,
        aggregate_version: 1,
        event_type: 'ListingImportedEvent',
      },
    ]);
  });

  it('should update the stored listing and create none when the same source and external id are ingested again', async () => {
    const first = fullListing({ externalId: '123', price: 250000, title: 'Piso luminoso' });
    await repository.save(first);
    const second = fullListing({ externalId: '123', price: 240000, title: 'Piso rebajado' });

    await repository.save(second);

    expect(await count('listing')).toBe(1);
    const loaded = await repository.findById(first.id);
    expect(loaded?.toPrimitives()).toEqual({ ...second.toPrimitives(), id: first.id.value });
    expect(loaded?.version).toBe(2);
    expect(second.version).toBe(2);
    const { rows } = await pool.query(
      'select distinct aggregate_id, aggregate_version from listings.outbox_event order by 2',
    );
    expect(rows).toEqual([
      { aggregate_id: first.id.value, aggregate_version: 1 },
      { aggregate_id: first.id.value, aggregate_version: 2 },
    ]);
  });

  it('should create two listings when the external ids differ', async () => {
    await repository.save(fullListing({ externalId: '123' }));
    await repository.save(fullListing({ externalId: '456' }));

    expect(await count('listing')).toBe(2);
  });

  it('should reject a second listing without external id and the same url', async () => {
    const build = () =>
      new ListingBuilder()
        .withSource(new SourceId('manual'))
        .withOriginalUrl(new ListingUrl('https://example.com/piso'))
        .withAddedAt(addedAt)
        .build();
    await repository.save(build());

    await expect(repository.save(build())).rejects.toThrow();

    expect(await count('listing')).toBe(1);
  });

  it('should raise an optimistic lock exception when a stale version is saved', async () => {
    const listing = fullListing({ externalId: '123' });
    await repository.save(listing);
    const first = await repository.findById(listing.id);
    const second = await repository.findById(listing.id);
    first?.create();
    await repository.save(first as ListingAggregate);
    second?.create();

    await expect(repository.save(second as ListingAggregate)).rejects.toBeInstanceOf(OptimisticLockException);
  });

  it('should return null for an unknown id and delete a stored listing', async () => {
    const listing = fullListing({ externalId: '123' });
    await repository.save(listing);

    await repository.delete(listing.id);

    expect(await repository.findById(listing.id)).toBeNull();
    expect(await repository.findById(ListingId.generate())).toBeNull();
  });
});
