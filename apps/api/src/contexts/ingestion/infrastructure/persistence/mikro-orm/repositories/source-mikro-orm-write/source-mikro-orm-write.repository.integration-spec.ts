import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SourceId } from '@house-radar/shared-kernel';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';
import { SourceBuilderFactory } from '@contexts/ingestion/domain/builders/source/source-builder.factory';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';
import { SourceRowMapper } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/mappers/source-row/source-row.mapper';
import { SourceMikroOrmWriteRepository } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/repositories/source-mikro-orm-write/source-mikro-orm-write.repository';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

describe('SourceMikroOrmWriteRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let write: SourceMikroOrmWriteRepository;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(createOrmOptions('ingestion', postgres.connectionUri));
    write = new SourceMikroOrmWriteRepository(orm.em, new SourceRowMapper(new SourceBuilderFactory()));
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  it('should find the manual source seeded by the migration, enabled', async () => {
    const source = await write.findById(new SourceId('manual'));

    expect(source?.toPrimitives()).toEqual({ id: 'manual', kind: 'manual', enabled: true });
  });

  it('should return null for an unknown source', async () => {
    expect(await write.findById(new SourceId('unknown'))).toBeNull();
  });

  it('should insert a new source and update an existing one by its key', async () => {
    const feed = new SourceBuilder().withId(new SourceId('feed-a')).withKind(new SourceKind('feed')).build();
    await write.save(feed);
    await write.save(
      new SourceBuilder().withId(new SourceId('feed-a')).withKind(new SourceKind('feed')).withEnabled(false).build(),
    );

    const stored = await write.findById(new SourceId('feed-a'));
    const { rows } = await pool.query('select count(*)::int as n from ingestion.source where id = $1', ['feed-a']);

    expect(stored?.toPrimitives()).toEqual({ id: 'feed-a', kind: 'feed', enabled: false });
    expect(rows[0].n).toBe(1);
  });

  it('should delete a source', async () => {
    await write.save(new SourceBuilder().withId(new SourceId('gone')).withKind(new SourceKind('api')).build());

    await write.delete(new SourceId('gone'));

    expect(await write.findById(new SourceId('gone'))).toBeNull();
  });
});
