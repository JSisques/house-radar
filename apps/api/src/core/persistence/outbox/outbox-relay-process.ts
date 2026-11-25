import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { defineConfig, MikroORM } from '@mikro-orm/postgresql';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

import { SnakeCaseNamingStrategy } from '@core/persistence/orm-config/orm-config.js';
import { bullmqOutboxDispatcher, outboxQueueName } from '@core/persistence/outbox/bullmq-outbox-dispatcher.js';
import { OUTBOX_CONTEXTS } from '@core/persistence/outbox/outbox-event.schema.js';
import { OutboxRelay } from '@core/persistence/outbox/outbox-relay.js';

export interface OutboxRelayProcessOptions {
  databaseUrl: string;
  redisUrl: string;
  intervalMs: number;
  /** Port of the healthcheck endpoint (`GET /health`). 0 picks a free one. */
  port: number;
}

export interface OutboxRelayProcess {
  port: number;
  /** Stops polling, closes the healthcheck server, the queues and the database connection. */
  stop(): Promise<void>;
}

/**
 * Runs one relay per outbox context (D31) that publishes to that context's BullMQ queue (D7), plus a tiny HTTP
 * healthcheck for `docker compose up --wait`: 200 when PostgreSQL and Redis answer, 503 otherwise. The relay only
 * issues raw SQL, so no entities are discovered.
 */
export async function startOutboxRelayProcess(options: OutboxRelayProcessOptions): Promise<OutboxRelayProcess> {
  const orm = await MikroORM.init(
    defineConfig({
      clientUrl: options.databaseUrl,
      entities: [],
      namingStrategy: SnakeCaseNamingStrategy,
      discovery: { warnWhenNoEntities: false },
    }),
  );
  const queues = OUTBOX_CONTEXTS.map(
    (context) => new Queue(outboxQueueName(context), { connection: { url: options.redisUrl } }),
  );
  // An unreachable Redis is reported by the healthcheck and retried by ioredis, not thrown as an unhandled error.
  for (const queue of queues) queue.on('error', () => undefined);

  // Own client for the healthcheck: fails fast instead of queueing PINGs while Redis is down.
  const healthRedis = new Redis(options.redisUrl, { maxRetriesPerRequest: 0, enableOfflineQueue: false });
  healthRedis.on('error', () => undefined);

  const relays = OUTBOX_CONTEXTS.map((context, index) => {
    const queue = queues[index] as Queue;
    return new OutboxRelay(orm.em.fork(), context, bullmqOutboxDispatcher(queue));
  });
  for (const relay of relays) relay.start(options.intervalMs);

  const server = createServer((request, response) => {
    if (request.method !== 'GET' || request.url !== '/health') {
      response.writeHead(404).end();
      return;
    }
    isHealthy(orm, healthRedis).then((healthy) => {
      response.writeHead(healthy ? 200 : 503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: healthy ? 'ok' : 'error' }));
    });
  });
  await new Promise<void>((resolve) => server.listen(options.port, resolve));

  return {
    port: (server.address() as AddressInfo).port,
    async stop() {
      for (const relay of relays) relay.stop();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      healthRedis.disconnect();
      await Promise.all(queues.map((queue) => queue.close()));
      await orm.close(true);
    },
  };
}

async function isHealthy(orm: MikroORM, redis: Redis): Promise<boolean> {
  try {
    await orm.em.fork().execute('select 1');
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
