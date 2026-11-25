import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { CONTEXT_SCHEMAS } from '@core/persistence/context-schema/context-schema.js';
import { runMigrations } from '@core/persistence/migrations/run-migrations.js';

async function rows<T extends pg.QueryResultRow>(uri: string, sql: string): Promise<T[]> {
  const client = new pg.Client({ connectionString: uri });
  await client.connect();
  try {
    return (await client.query<T>(sql)).rows;
  } finally {
    await client.end();
  }
}

describe('persistence migrations', () => {
  let postgres: StartedPostgres;

  beforeAll(async () => {
    postgres = await startPostgres();
  });
  afterEach(async () => {
    await postgres.reset();
  });
  afterAll(async () => {
    await postgres.stop();
  });

  it('should create every context schema and enable postgis on an empty database', async () => {
    await postgres.reset();
    await rows(postgres.connectionUri, 'DROP EXTENSION postgis CASCADE');

    await runMigrations(postgres.connectionUri);

    const schemas = await rows<{ schema_name: string }>(
      postgres.connectionUri,
      'SELECT schema_name FROM information_schema.schemata',
    );
    const extensions = await rows(postgres.connectionUri, "SELECT 1 FROM pg_extension WHERE extname = 'postgis'");
    expect(schemas.map((s) => s.schema_name)).toEqual(expect.arrayContaining([...CONTEXT_SCHEMAS]));
    expect(extensions).toHaveLength(1);
  });

  it('should create the outbox table with its unpublished index only in the event-emitting contexts', async () => {
    await postgres.reset();
    await rows(postgres.connectionUri, 'DROP EXTENSION postgis CASCADE');

    await runMigrations(postgres.connectionUri);

    const tables = await rows<{ table_schema: string }>(
      postgres.connectionUri,
      "SELECT table_schema FROM information_schema.tables WHERE table_name = 'outbox_event'",
    );
    expect(tables.map((t) => t.table_schema).sort()).toEqual(['identity', 'ingestion', 'listings', 'properties']);
    const columns = await rows<{ column_name: string }>(
      postgres.connectionUri,
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'listings' AND table_name = 'outbox_event'",
    );
    expect(columns.map((c) => c.column_name).sort()).toEqual(
      [
        'id',
        'aggregate_type',
        'aggregate_id',
        'aggregate_version',
        'event_type',
        'schema_version',
        'payload',
        'metadata',
        'occurred_at',
        'published_at',
      ].sort(),
    );
    const indexes = await rows<{ indexdef: string }>(
      postgres.connectionUri,
      "SELECT indexdef FROM pg_indexes WHERE schemaname = 'listings' AND indexname = 'outbox_event_unpublished_idx'",
    );
    expect(indexes[0]?.indexdef).toContain('WHERE (published_at IS NULL)');
  });

  it('should be idempotent when run twice', async () => {
    await postgres.reset();
    await rows(postgres.connectionUri, 'DROP EXTENSION postgis CASCADE');
    await runMigrations(postgres.connectionUri);
    const first = await rows(postgres.connectionUri, 'SELECT * FROM public.mikro_orm_migrations ORDER BY id');

    await expect(runMigrations(postgres.connectionUri)).resolves.toBeUndefined();

    const second = await rows(postgres.connectionUri, 'SELECT * FROM public.mikro_orm_migrations ORDER BY id');
    expect(second).toEqual(first);
  });
});
