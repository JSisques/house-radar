import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateUuidV7 } from '@house-radar/building-blocks';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';
import { createOutboxEventSchema } from '@core/persistence/outbox/outbox-event.schema.js';
import { type OutboxMessage, OutboxRelay } from '@core/persistence/outbox/outbox-relay.js';
import { IdempotentConsumer } from '@core/persistence/processed-event/idempotent-consumer.js';
import { createProcessedEventSchema } from '@core/persistence/processed-event/processed-event.schema.js';

describe('OutboxRelay', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(
      createOrmOptions('listings', postgres.connectionUri, {
        entities: [createOutboxEventSchema('listings'), createProcessedEventSchema('properties')],
      }),
    );
  });
  afterEach(async () => {
    await pool.query('truncate listings.outbox_event, properties.processed_event');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  async function insertEvent(overrides: { aggregateVersion?: number; occurredAt?: Date } = {}): Promise<string> {
    const id = generateUuidV7();
    await pool.query(
      `insert into listings.outbox_event
        (id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at)
       values ($1, 'Widget', $2, $3, 'WidgetRenamed', 1, '{"name":"a"}', '{"correlationId":"c","causationId":null}', $4)`,
      [id, generateUuidV7(), overrides.aggregateVersion ?? 1, overrides.occurredAt ?? new Date()],
    );
    return id;
  }

  async function publishedAt(id: string): Promise<Date | null> {
    const { rows } = await pool.query('select published_at from listings.outbox_event where id = $1', [id]);
    return rows[0].published_at;
  }

  function relay(handler: (message: OutboxMessage) => Promise<void>): OutboxRelay {
    return new OutboxRelay(orm.em, 'listings', handler);
  }

  it('should deliver an unpublished row once and mark it published', async () => {
    const id = await insertEvent({ aggregateVersion: 3 });
    const received: OutboxMessage[] = [];
    const subject = relay(async (message) => void received.push(message));

    await subject.runOnce();
    await subject.runOnce();

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      eventId: id,
      eventType: 'WidgetRenamed',
      aggregateType: 'Widget',
      aggregateVersion: 3,
      schemaVersion: 1,
      payload: { name: 'a' },
      metadata: { correlationId: 'c', causationId: null },
    });
    expect(received[0]?.occurredAt).toBeInstanceOf(Date);
    expect(await publishedAt(id)).toBeInstanceOf(Date);
  });

  it('should deliver in occurrence order', async () => {
    const later = await insertEvent({ occurredAt: new Date('2026-01-02T00:00:00Z') });
    const earlier = await insertEvent({ occurredAt: new Date('2026-01-01T00:00:00Z') });
    const order: string[] = [];

    await relay(async (message) => void order.push(message.eventId)).runOnce();

    expect(order).toEqual([earlier, later]);
  });

  it('should deliver again on the next run when the handler failed', async () => {
    const id = await insertEvent();
    let attempts = 0;
    const subject = relay(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('boom');
    });

    await expect(subject.runOnce()).resolves.toMatchObject({ delivered: 0, failed: 1 });
    expect(await publishedAt(id)).toBeNull();

    await expect(subject.runOnce()).resolves.toMatchObject({ delivered: 1, failed: 0 });
    expect(attempts).toBe(2);
    expect(await publishedAt(id)).toBeInstanceOf(Date);
  });

  it('should keep the events delivered before a failure published and stop at the failing one', async () => {
    const first = await insertEvent({ occurredAt: new Date('2026-01-01T00:00:00Z') });
    const failing = await insertEvent({ occurredAt: new Date('2026-01-02T00:00:00Z') });
    const third = await insertEvent({ occurredAt: new Date('2026-01-03T00:00:00Z') });
    const seen: string[] = [];

    const result = await relay(async (message) => {
      seen.push(message.eventId);
      if (message.eventId === failing) throw new Error('boom');
    }).runOnce();

    expect(result).toMatchObject({ delivered: 1, failed: 1 });
    expect(seen).toEqual([first, failing]);
    expect(await publishedAt(first)).toBeInstanceOf(Date);
    expect(await publishedAt(failing)).toBeNull();
    expect(await publishedAt(third)).toBeNull();
  });

  it('should not dispatch an event twice when two relays run concurrently', async () => {
    for (let i = 0; i < 6; i += 1) await insertEvent();
    const delivered: string[] = [];
    const slow = async (message: OutboxMessage): Promise<void> => {
      delivered.push(message.eventId);
      await new Promise((resolve) => setTimeout(resolve, 50));
    };

    await Promise.all([
      new OutboxRelay(orm.em.fork(), 'listings', slow, { batchSize: 3 }).runOnce(),
      new OutboxRelay(orm.em.fork(), 'listings', slow, { batchSize: 3 }).runOnce(),
    ]);

    expect(delivered).toHaveLength(6);
    expect(new Set(delivered).size).toBe(6);
  });

  it('should skip a redelivered event the consumer already processed', async () => {
    const id = await insertEvent();
    const consumer = new IdempotentConsumer(orm.em, 'properties');
    let applied = 0;
    const handle = (message: OutboxMessage): Promise<unknown> =>
      consumer.run(message.eventId, 'projector', async () => void (applied += 1));

    // The first delivery is processed but the relay fails before marking it published, so it is redelivered.
    await handle({ eventId: id } as OutboxMessage);
    await relay(async (message) => void (await handle(message))).runOnce();

    expect(applied).toBe(1);
    expect(await publishedAt(id)).toBeInstanceOf(Date);
  });
});
