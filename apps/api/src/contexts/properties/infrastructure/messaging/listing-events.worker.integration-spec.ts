import { Queue } from 'bullmq';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { bullmqOutboxDispatcher, type OutboxMessage, outboxQueueName } from '@house-radar/outbox';
import { type StartedRedis, startRedis } from '@house-radar/testing';

import { ListingEventsWorker } from '@contexts/properties/infrastructure/messaging/listing-events.worker';
import type { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed.consumer';
import type { AppConfig } from '@core/config/app-config/app-config.js';

const message: OutboxMessage = {
  eventId: '01900000-0000-7000-8000-0000000000aa',
  aggregateType: 'Observation',
  aggregateId: '01900000-0000-7000-8000-0000000000bb',
  aggregateVersion: 2,
  eventType: 'ListingObservedEvent',
  schemaVersion: 1,
  payload: { listingId: '01900000-0000-7000-8000-0000000000cc' },
  metadata: { correlationId: 'c1', causationId: null },
  occurredAt: new Date('2026-11-26T10:00:00.000Z'),
};

describe('ListingEventsWorker', () => {
  let redis: StartedRedis;
  let queue: Queue;
  let worker: ListingEventsWorker;
  const handle = vi.fn<(received: OutboxMessage) => Promise<void>>().mockResolvedValue(undefined);

  beforeAll(async () => {
    redis = await startRedis();
    queue = new Queue(outboxQueueName('listings'), { connection: { url: redis.url } });
    worker = new ListingEventsWorker(
      { redisUrl: redis.url } as AppConfig,
      { handle } as unknown as ListingObservedConsumer,
    );
    worker.onModuleInit();
  });
  afterAll(async () => {
    await worker.onApplicationShutdown();
    await queue.close();
    await redis.stop();
  });

  it('hands a message published by the relay to the consumer, with occurredAt as a Date', async () => {
    await bullmqOutboxDispatcher(queue)(message);

    await vi.waitFor(() => expect(handle).toHaveBeenCalledTimes(1), { timeout: 10_000 });
    expect(handle).toHaveBeenCalledWith(message);
  });
});
