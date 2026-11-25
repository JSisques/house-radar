import { MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { generateUuidV7 } from '@house-radar/building-blocks';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';
import { IdempotentConsumer } from '@core/persistence/processed-event/idempotent-consumer.js';
import { createProcessedEventSchema } from '@core/persistence/processed-event/processed-event.schema.js';

describe('IdempotentConsumer', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let consumer: IdempotentConsumer;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    orm = await MikroORM.init(
      createOrmOptions('users', postgres.connectionUri, { entities: [createProcessedEventSchema('users')] }),
    );
    consumer = new IdempotentConsumer(orm.em, 'users');
  });
  afterEach(async () => {
    await pool.query('truncate users.processed_event');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  it('should run the work once per event and consumer', async () => {
    const eventId = generateUuidV7();
    let runs = 0;
    const work = async (): Promise<void> => void (runs += 1);

    const first = await consumer.run(eventId, 'projector', work);
    const second = await consumer.run(eventId, 'projector', work);

    expect([first, second]).toEqual([true, false]);
    expect(runs).toBe(1);
  });

  it('should treat the same event as new for a different consumer', async () => {
    const eventId = generateUuidV7();

    await consumer.run(eventId, 'a', async () => {});

    await expect(consumer.run(eventId, 'b', async () => {})).resolves.toBe(true);
  });

  it('should release the claim when the work fails so a redelivery runs it again', async () => {
    const eventId = generateUuidV7();

    await expect(
      consumer.run(eventId, 'projector', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    await expect(consumer.run(eventId, 'projector', async () => {})).resolves.toBe(true);
  });
});
