import { randomUUID } from 'node:crypto';

import { Queue } from 'bullmq';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { outboxQueueName, type OutboxRelayProcess, startOutboxRelayProcess } from '@house-radar/outbox';
import { createOutboxTables } from '@house-radar/outbox/testing';
import { type StartedPostgres, type StartedRedis, startPostgres, startRedis } from '@house-radar/testing';

describe('startOutboxRelayProcess', () => {
  let postgres: StartedPostgres;
  let redis: StartedRedis;
  let pool: pg.Pool;
  let queue: Queue;
  let relay: OutboxRelayProcess | undefined;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([startPostgres(), startRedis()]);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    await createOutboxTables(postgres.connectionUri);
    queue = new Queue(outboxQueueName('listings'), { connection: { url: redis.url } });
  });
  afterEach(async () => {
    await relay?.stop();
    relay = undefined;
    await pool.query('truncate listings.outbox_event');
    await queue.obliterate({ force: true });
  });
  afterAll(async () => {
    await queue.close();
    await pool.end();
    await Promise.all([postgres.stop(), redis.stop()]);
  });

  const start = async () =>
    (relay = await startOutboxRelayProcess({
      databaseUrl: postgres.connectionUri,
      redisUrl: redis.url,
      intervalMs: 50,
      port: 0,
    }));

  it('reports healthy on GET /health when PostgreSQL and Redis are reachable', async () => {
    const { port } = await start();

    const response = await fetch(`http://127.0.0.1:${port}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('publishes unpublished outbox rows to the context queue and marks them published', async () => {
    const id = randomUUID();
    await pool.query(
      `insert into listings.outbox_event (id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at)
       values ($1, 'Listing', $2, 1, 'ListingCreated', 1, '{}', '{"correlationId":"c","causationId":null}', now())`,
      [id, randomUUID()],
    );

    await start();

    await expect.poll(async () => (await queue.getJob(id))?.name).toBe('ListingCreated');
    await expect
      .poll(
        async () =>
          (await pool.query('select published_at from listings.outbox_event where id = $1', [id])).rows[0].published_at,
      )
      .not.toBeNull();
  });

  it('stops polling and releases its port on stop()', async () => {
    const { port, stop } = await start();
    relay = undefined;

    await stop();

    await expect(fetch(`http://127.0.0.1:${port}/health`)).rejects.toThrow();
  });
});
