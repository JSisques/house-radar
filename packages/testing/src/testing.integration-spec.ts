import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, startPostgres } from './postgres.js';
import { type StartedRedis, startRedis } from './redis.js';

async function query<T extends pg.QueryResultRow>(uri: string, sql: string): Promise<T[]> {
  const client = new pg.Client({ connectionString: uri });
  await client.connect();
  try {
    return (await client.query<T>(sql)).rows;
  } finally {
    await client.end();
  }
}

describe('startPostgres', () => {
  let postgres: StartedPostgres;

  beforeAll(async () => {
    postgres = await startPostgres();
  });
  afterAll(async () => {
    await postgres.stop();
  });

  it('should provide a database with postgis enabled', async () => {
    const rows = await query<{ extname: string }>(
      postgres.connectionUri,
      "SELECT extname FROM pg_extension WHERE extname = 'postgis'",
    );

    expect(rows).toHaveLength(1);
  });

  it('should drop user data and keep postgis on reset', async () => {
    await query(postgres.connectionUri, 'CREATE TABLE leftover (id int)');

    await postgres.reset();

    const tables = await query(postgres.connectionUri, "SELECT 1 FROM pg_tables WHERE tablename = 'leftover'");
    const postgis = await query(postgres.connectionUri, "SELECT 1 FROM pg_extension WHERE extname = 'postgis'");
    expect(tables).toHaveLength(0);
    expect(postgis).toHaveLength(1);
  });
});

describe('isolation between suites', () => {
  it('should not share state between two parallel databases', async () => {
    const [a, b] = await Promise.all([startPostgres(), startPostgres()]);
    try {
      await query(a.connectionUri, 'CREATE TABLE only_in_a (id int)');

      const rows = await query(b.connectionUri, "SELECT 1 FROM pg_tables WHERE tablename = 'only_in_a'");

      expect(rows).toHaveLength(0);
    } finally {
      await Promise.all([a.stop(), b.stop()]);
    }
  });
});

describe('startRedis', () => {
  let redis: StartedRedis;

  beforeAll(async () => {
    redis = await startRedis();
  });
  afterAll(async () => {
    await redis.stop();
  });

  it('should provide a reachable redis url', () => {
    expect(redis.url).toMatch(/^redis:\/\//);
  });

  it('should reset without error', async () => {
    await expect(redis.reset()).resolves.toBeUndefined();
  });
});
