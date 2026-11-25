import { MikroORM } from '@mikro-orm/postgresql';
import { Queue } from 'bullmq';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateUuidV7 } from '@house-radar/building-blocks';
import { bullmqOutboxDispatcher, outboxQueueName } from '@house-radar/outbox';
import { createOutboxEventSchema } from '@house-radar/outbox';
import { OutboxRelay } from '@house-radar/outbox';
import { type StartedPostgres, type StartedRedis, startPostgres, startRedis } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';

describe('bullmqOutboxDispatcher', () => {
  let postgres: StartedPostgres;
  let redis: StartedRedis;
  let pool: pg.Pool;
  let orm: MikroORM;
  let queue: Queue;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([startPostgres(), startRedis()]);
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(
      createOrmOptions('listings', postgres.connectionUri, { entities: [createOutboxEventSchema('listings')] }),
    );
    queue = new Queue(outboxQueueName('listings'), { connection: { url: redis.url } });
  });
  afterEach(async () => {
    await pool.query('truncate listings.outbox_event');
    await queue.obliterate({ force: true });
  });
  afterAll(async () => {
    await queue.close();
    await orm.close(true);
    await pool.end();
    await Promise.all([postgres.stop(), redis.stop()]);
  });

  async function insertEvent(id = generateUuidV7()): Promise<string> {
    await pool.query(
      `insert into listings.outbox_event
        (id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at)
       values ($1, 'Widget', $2, 4, 'WidgetRenamed', 1, '{"name":"a"}', '{"correlationId":"c","causationId":null}', $3)`,
      [id, generateUuidV7(), new Date('2026-01-01T00:00:00Z')],
    );
    return id;
  }

  it('should name the queue after the context', () => {
    expect(outboxQueueName('listings')).toBe('listings.events');
  });

  it('should enqueue the event as a job with the event id as job id and mark the row published', async () => {
    const id = await insertEvent();
    const relay = new OutboxRelay(orm.em, 'listings', bullmqOutboxDispatcher(queue));

    await expect(relay.runOnce()).resolves.toMatchObject({ delivered: 1, failed: 0 });

    const job = await queue.getJob(id);
    expect(job?.name).toBe('WidgetRenamed');
    expect(job?.data).toEqual({
      eventId: id,
      eventType: 'WidgetRenamed',
      aggregateType: 'Widget',
      aggregateId: expect.any(String),
      aggregateVersion: 4,
      schemaVersion: 1,
      payload: { name: 'a' },
      metadata: { correlationId: 'c', causationId: null },
      occurredAt: '2026-01-01T00:00:00.000Z',
    });
    const { rows } = await pool.query('select published_at from listings.outbox_event where id = $1', [id]);
    expect(rows[0].published_at).toBeInstanceOf(Date);
  });

  it('should not enqueue a second job when the same event is redelivered', async () => {
    const id = await insertEvent();
    const dispatch = bullmqOutboxDispatcher(queue);
    const relay = new OutboxRelay(orm.em, 'listings', dispatch);
    await relay.runOnce();
    // The row is republished as if the relay had crashed after enqueueing but before marking it.
    await pool.query('update listings.outbox_event set published_at = null where id = $1', [id]);

    await relay.runOnce();

    expect(await queue.getJobCountByTypes('waiting', 'active', 'delayed')).toBe(1);
  });

  it('should leave the row unpublished when Redis rejects the job', async () => {
    const id = await insertEvent();
    const broken = { add: () => Promise.reject(new Error('redis down')) } as unknown as Queue;

    await expect(new OutboxRelay(orm.em, 'listings', bullmqOutboxDispatcher(broken)).runOnce()).resolves.toMatchObject({
      delivered: 0,
      failed: 1,
    });

    const { rows } = await pool.query('select published_at from listings.outbox_event where id = $1', [id]);
    expect(rows[0].published_at).toBeNull();
  });
});
