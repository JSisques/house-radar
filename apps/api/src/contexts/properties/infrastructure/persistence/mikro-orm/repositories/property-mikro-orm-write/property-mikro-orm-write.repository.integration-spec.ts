import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ListingId, PropertyId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { PropertyBuilderFactory } from '@contexts/properties/domain/builders/property/property-builder.factory';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import { PropertyMikroOrmWriteRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-mikro-orm-write/property-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { OptimisticLockException } from '@core/persistence/optimistic-lock/optimistic-lock.exception.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

const builders = new PropertyBuilderFactory();

function newProperty(listingId: ListingId = ListingId.generate(), version = 1) {
  const property = builders.create().withListing(listingId, version).build();
  property.create();
  return property;
}

describe('PropertyMikroOrmWriteRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let repository: PropertyMikroOrmWriteRepository;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(createOrmOptions('properties', postgres.connectionUri));
    repository = new PropertyMikroOrmWriteRepository(orm.em, new PropertyRowMapper(builders));
  });
  afterEach(async () => {
    await pool.query('truncate properties.property cascade');
    await pool.query('truncate properties.outbox_event');
  });
  afterAll(async () => {
    await orm.close();
    await pool.end();
    await postgres.stop();
  });

  it('saves a property with its listings and reads it back', async () => {
    const listingId = ListingId.generate();
    const property = newProperty(listingId, 3);

    await repository.save(property);

    const found = await repository.findById(property.id);
    expect(found?.toPrimitives()).toEqual(property.toPrimitives());
    expect(found?.appliedVersionOf(listingId)).toBe(3);
    expect(found?.version).toBe(1);
  });

  it('returns null for an unknown property', async () => {
    expect(await repository.findById(PropertyId.generate())).toBeNull();
  });

  it('finds a property by the listing it contains', async () => {
    const listingId = ListingId.generate();
    const property = newProperty(listingId);
    await repository.save(property);
    await repository.save(newProperty());

    const found = await repository.findByListingId(listingId);

    expect(found?.id.value).toBe(property.id.value);
  });

  it('returns null when no property contains the listing', async () => {
    expect(await repository.findByListingId(ListingId.generate())).toBeNull();
  });

  it('stores PropertyCreatedEvent in the properties outbox with the saved version', async () => {
    const property = newProperty();

    await repository.save(property);

    const { rows } = await pool.query(
      'select aggregate_type, aggregate_id, aggregate_version, event_type, published_at from properties.outbox_event',
    );
    expect(rows).toEqual([
      {
        aggregate_type: 'Property',
        aggregate_id: property.id.value,
        aggregate_version: 1,
        event_type: 'PropertyCreatedEvent',
        published_at: null,
      },
    ]);
    expect(property.peekDomainEvents()).toHaveLength(0);
  });

  it('persists the applied version of a listing and bumps the property version', async () => {
    const listingId = ListingId.generate();
    const property = newProperty(listingId, 1);
    await repository.save(property);

    const loaded = await repository.findById(property.id);
    loaded?.recordListingVersion(listingId, 5);
    await repository.save(loaded!);

    const reloaded = await repository.findById(property.id);
    expect(reloaded?.appliedVersionOf(listingId)).toBe(5);
    expect(reloaded?.version).toBe(2);
    const { rows } = await pool.query('select count(*)::int as total from properties.property_listing');
    expect(rows[0].total).toBe(1);
  });

  it('rejects a stale save with OptimisticLockException', async () => {
    const listingId = ListingId.generate();
    const property = newProperty(listingId);
    await repository.save(property);

    const first = await repository.findById(property.id);
    const second = await repository.findById(property.id);
    first?.recordListingVersion(listingId, 2);
    await repository.save(first!);
    second?.recordListingVersion(listingId, 3);

    await expect(repository.save(second!)).rejects.toBeInstanceOf(OptimisticLockException);
  });

  it('refuses a second property for the same listing', async () => {
    const listingId = ListingId.generate();
    await repository.save(newProperty(listingId));

    await expect(repository.save(newProperty(listingId))).rejects.toThrow();
  });

  it('deletes a property and its listings', async () => {
    const property = newProperty();
    await repository.save(property);

    await repository.delete(property.id);

    expect(await repository.findById(property.id)).toBeNull();
    const { rows } = await pool.query('select count(*)::int as total from properties.property_listing');
    expect(rows[0].total).toBe(0);
  });
});
