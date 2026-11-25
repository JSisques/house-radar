import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EntitySchema } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

// A table no migration creates, so the generated diff is never empty.
const Listing = new EntitySchema({
  name: 'MigrationProbe',
  schema: 'listings',
  tableName: 'migration_probe',
  properties: { id: { type: 'uuid', primary: true } },
});

describe('migration generation', () => {
  let postgres: StartedPostgres;
  let dir: string;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    // The ingestion context owns `ingestion.source` (created by its migration): a listings migration must not drop it.
    dir = await mkdtemp(join(tmpdir(), 'house-radar-migrations-'));
  });
  afterAll(async () => {
    await postgres.stop();
    await rm(dir, { recursive: true, force: true });
  });

  it('should only touch its own schema when a context migration is generated', async () => {
    const orm = await MikroORM.init(
      createOrmOptions('listings', postgres.connectionUri, {
        entities: [Listing],
        migrations: { path: dir, schema: 'listings', emit: 'ts', snapshot: false },
      }),
    );
    try {
      await orm.migrator.create();
    } finally {
      await orm.close(true);
    }

    const [file] = await readdir(dir);
    const sql = await readFile(join(dir, file ?? ''), 'utf8');
    expect(sql).toContain('migration_probe');
    expect(sql).not.toContain('ingestion');
    // `source_id` columns of the listings tables are legitimate: only the other context's table must be absent.
    expect(sql).not.toContain('"source"');
  });
});
