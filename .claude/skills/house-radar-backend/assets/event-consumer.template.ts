// Path: src/contexts/<context>/transport/messaging/consumers/listing-price-changed.consumer.ts
// Transport = everything inbound (C3). The consumer only maps the outbox payload to a command
// and sends it through the CommandBus (C4). No repositories, no EntityManager, no business logic.
// The relay publishes outbox rows through BullMQ at least once; idempotency lives in the handler.
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';

import { ProjectListingPriceChangeCommand } from '@contexts/properties/application/commands/project-listing-price-change/project-listing-price-change.command';

interface IOutboxMessage {
  eventId: string; // outbox_event.id (UUIDv7)
  eventType: string;
  occurredAt: string;
  payload: { id: string; newPrice: { amountCents: number } };
}

@Processor('listings.events')
export class ListingPriceChangedConsumer extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<IOutboxMessage>): Promise<void> {
    if (job.data.eventType !== 'ListingPriceChanged') {
      return;
    }
    await this.commandBus.execute(
      new ProjectListingPriceChangeCommand({
        eventId: job.data.eventId,
        listingId: job.data.payload.id,
        newPriceCents: job.data.payload.newPrice.amountCents,
        occurredAt: new Date(job.data.occurredAt),
      }),
    );
  }
}
