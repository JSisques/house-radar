import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OUTBOX_CONTEXTS } from '@house-radar/outbox';
import { createOutboxTables } from '@house-radar/outbox/testing';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';

async function outboxColumns(connectionUri: string, context: string): Promise<unknown[]> {
  const pool = new pg.Pool({ connectionString: connectionUri });
  try {
    const { rows } = await pool.query(
      `select column_name, data_type, is_nullable from information_schema.columns
       where table_schema = $1 and table_name = 'outbox_event' order by column_name`,
      [context],
    );
    return rows;
  } finally {
    await pool.end();
  }
}

// @house-radar/outbox builds its test tables from createOutboxEventSchema; the relay and the write repository read
// that same schema, so the real migrations must produce the same columns.
describe('outbox_event table', () => {
  let migrated: StartedPostgres;
  let fromSchema: StartedPostgres;

  beforeAll(async () => {
    [migrated, fromSchema] = await Promise.all([startPostgres(), startPostgres()]);
    await runMigrations(migrated.connectionUri);
    await createOutboxTables(fromSchema.connectionUri);
  });
  afterAll(async () => {
    await Promise.all([migrated.stop(), fromSchema.stop()]);
  });

  it.each(OUTBOX_CONTEXTS)(
    'should have the same columns in the %s migration as in the shared schema',
    async (context) => {
      const expected = await outboxColumns(fromSchema.connectionUri, context);

      expect(expected.length).toBeGreaterThan(0);
      expect(await outboxColumns(migrated.connectionUri, context)).toEqual(expected);
    },
  );
});
