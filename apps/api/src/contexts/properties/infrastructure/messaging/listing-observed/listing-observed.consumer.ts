import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type { OutboxMessage } from '@house-radar/outbox';

import { CreatePropertyFromListingObservedCommand } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.command';

export const LISTING_OBSERVED_EVENT_TYPE = 'ListingObservedEvent';

/**
 * Receives the listings outbox stream (from the relay or a queue worker) and turns every `ListingObserved` into the
 * command that gives the listing a property. Other event types are not its concern and are skipped.
 */
@Injectable()
export class ListingObservedConsumer {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  async handle(message: OutboxMessage): Promise<void> {
    if (message.eventType !== LISTING_OBSERVED_EVENT_TYPE) return;
    const { listingId } = message.payload as { listingId: string };
    await this.commands.execute(
      new CreatePropertyFromListingObservedCommand({
        eventId: message.eventId,
        listingId,
        aggregateVersion: message.aggregateVersion,
      }),
    );
  }
}
