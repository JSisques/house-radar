import { Inject, Injectable, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';

import { type OutboxMessage, outboxQueueName } from '@house-radar/outbox';

import { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed.consumer';
import { AppConfig } from '@core/config/app-config/app-config.js';

type QueuedMessage = Omit<OutboxMessage, 'occurredAt'> & { occurredAt: string };

/**
 * Consumes the `listings.events` queue that the outbox relay publishes to (D31, D7). A failing job is retried by
 * BullMQ; the consumer is idempotent, so a redelivery is skipped.
 */
@Injectable()
export class ListingEventsWorker implements OnModuleInit, OnApplicationShutdown {
  private worker: Worker<QueuedMessage> | undefined;

  constructor(
    @Inject(AppConfig) private readonly config: AppConfig,
    @Inject(ListingObservedConsumer) private readonly consumer: ListingObservedConsumer,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<QueuedMessage>(
      outboxQueueName('listings'),
      (job) => this.consumer.handle({ ...job.data, occurredAt: new Date(job.data.occurredAt) }),
      { connection: { url: this.config.redisUrl } },
    );
    // An unreachable Redis is retried by ioredis and reported by the healthcheck, not thrown as an unhandled error.
    this.worker.on('error', () => undefined);
  }

  async onApplicationShutdown(): Promise<void> {
    // Forced: a graceful close waits for the Redis connection, which hangs the shutdown when Redis is unreachable.
    await this.worker?.close(true);
  }
}
