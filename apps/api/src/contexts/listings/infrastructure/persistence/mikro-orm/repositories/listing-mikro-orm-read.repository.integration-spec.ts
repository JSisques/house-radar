import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Criteria, DateValueObject, InvalidFilterFieldException } from '@house-radar/building-blocks';
import { ExternalId, ListingId, ListingUrl, SourceId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import { ListingMikroOrmReadRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-read.repository';
import { ListingMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

function listing(source: string, externalId: string, day: number): ListingAggregate {
  return new ListingBuilder()
    .withSource(new SourceId(source))
    .withExternalId(new ExternalId(externalId))
    .withOriginalUrl(new ListingUrl(`https://${source}.example.com/${externalId}`))
    .withAddedAt(new DateValueObject(new Date(`2026-11-${day}T10:00:00.000Z`)))
    .build();
}

describe('ListingMikroOrmReadRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let write: ListingMikroOrmWriteRepository;
  let read: ListingMikroOrmReadRepository;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(createOrmOptions('listings', postgres.connectionUri));
    write = new ListingMikroOrmWriteRepository(orm.em);
    read = new ListingMikroOrmReadRepository(orm.em);
  });
  afterEach(async () => {
    await pool.query('truncate listings.observation, listings.listing, listings.outbox_event cascade');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  it('should return the stored listing as primitives and null for an unknown id', async () => {
    const saved = listing('idealista', '1', 10);
    await write.save(saved);

    expect(await read.findById(saved.id)).toEqual(saved.toPrimitives());
    expect(await read.findById(ListingId.generate())).toBeNull();
  });

  it('should filter by source', async () => {
    await write.save(listing('idealista', '1', 10));
    await write.save(listing('fotocasa', '2', 11));

    const result = await read.findByCriteria(
      new Criteria().addFilter({ field: 'source', operator: 'eq', value: 'fotocasa' }),
    );

    expect(result.total).toBe(1);
    expect(result.items.map((item) => item.source)).toEqual(['fotocasa']);
  });

  it('should sort and paginate', async () => {
    await write.save(listing('idealista', '1', 10));
    await write.save(listing('idealista', '2', 11));
    await write.save(listing('idealista', '3', 12));

    const result = await read.findByCriteria(
      new Criteria().addSort({ field: 'addedAt', direction: 'desc' }).paginate({ page: 2, pageSize: 2 }),
    );

    expect(result.total).toBe(3);
    expect(result.items.map((item) => item.externalId)).toEqual(['1']);
    expect(result.page).toBe(2);
  });

  it('should reject a field outside the whitelist', async () => {
    await expect(
      read.findByCriteria(new Criteria().addFilter({ field: 'title', operator: 'eq', value: 'x' })),
    ).rejects.toBeInstanceOf(InvalidFilterFieldException);
  });
});
