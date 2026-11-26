import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type { OutboxMessage } from '@house-radar/outbox';

import { CreatePropertyFromListingObservedCommand } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.command';
import { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import { ListingEventPayloadMapper } from '@contexts/properties/infrastructure/messaging/listing-event-payload/listing-event-payload.mapper';

export const LISTING_OBSERVED_EVENT_TYPE = 'ListingObservedEvent';
export const LISTING_IMPORTED_EVENT_TYPE = 'ListingImportedEvent';

type Payload = Readonly<Record<string, unknown>>;

/**
 * Receives the listings outbox stream (from the relay or a queue worker). A `ListingObserved` gives the listing a
 * property and then updates the search view; a `ListingImported` records the listing attributes in it. Other event
 * types are not its concern and are skipped.
 */
@Injectable()
export class ListingObservedConsumer {
  constructor(
    @Inject(CommandBus) private readonly commands: CommandBus,
    @Inject(ListingEventPayloadMapper) private readonly payloads: ListingEventPayloadMapper,
  ) {}

  async handle(message: OutboxMessage): Promise<void> {
    const payload = message.payload as Payload;
    if (message.eventType === LISTING_OBSERVED_EVENT_TYPE) {
      const listingId = payload['listingId'] as string;
      // The property comes first: the view is refreshed per property, so the listing must belong to one.
      await this.commands.execute(
        new CreatePropertyFromListingObservedCommand({
          eventId: message.eventId,
          listingId,
          aggregateVersion: message.aggregateVersion,
        }),
      );
      await this.commands.execute(
        new ProjectListingObservedCommand({
          eventId: message.eventId,
          listingId,
          status: payload['status'] as string,
          priceCents: this.payloads.toPriceCents(payload),
          observedAt: new Date(payload['observedAt'] as string),
        }),
      );
    } else if (message.eventType === LISTING_IMPORTED_EVENT_TYPE) {
      await this.commands.execute(
        new ProjectListingImportedCommand({
          eventId: message.eventId,
          listingId: payload['id'] as string,
          source: payload['source'] as string,
          status: payload['status'] as string,
          priceCents: this.payloads.toPriceCents(payload),
          attributes: this.payloads.toAttributes(payload),
          observedAt: new Date(payload['lastCheckedAt'] as string),
        }),
      );
    }
  }
}
