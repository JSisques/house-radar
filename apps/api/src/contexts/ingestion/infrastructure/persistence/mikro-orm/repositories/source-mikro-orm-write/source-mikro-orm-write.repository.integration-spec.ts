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

  it('should find the manual source seeded by the migration by its kind, enabled, with a generated id', async () => {
    const source = await write.findByKind(SourceKind.manual());

    expect(source?.toPrimitives()).toEqual({ id: expect.any(String), kind: 'manual', enabled: true });
    expect(await write.findById(source!.id)).not.toBeNull();
  });

  it('should return null for an unknown source or a kind with no source', async () => {
    expect(await write.findById(SourceId.generate())).toBeNull();
    expect(await write.findByKind(new SourceKind('feed'))).toBeNull();
  });

  it('should insert a new source and update an existing one by its id', async () => {
    const id = SourceId.generate();
    await write.save(new SourceBuilder().withId(id).withKind(new SourceKind('feed')).build());
    await write.save(new SourceBuilder().withId(id).withKind(new SourceKind('feed')).withEnabled(false).build());

    const stored = await write.findById(id);
    const { rows } = await pool.query('select count(*)::int as n from ingestion.source where id = $1', [id.value]);

    expect(stored?.toPrimitives()).toEqual({ id: id.value, kind: 'feed', enabled: false });
    expect(rows[0].n).toBe(1);
  });

  it('should delete a source', async () => {
    const id = SourceId.generate();
    await write.save(new SourceBuilder().withId(id).withKind(new SourceKind('api')).build());

    await write.delete(id);

    expect(await write.findById(id)).toBeNull();
  });
});
