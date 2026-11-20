// Path: src/contexts/<context>/application/event-handlers/<event-name>/<event-name>.handler.ts
// Events arrive at least once (outbox relay + BullMQ, D31), so every consumer is idempotent:
// it claims (event_id, consumer) in `processed_event` inside the same transaction as its own
// writes. A redelivered event finds the claim and does nothing.
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import {
  IPropertyViewProjector,
  PROPERTY_VIEW_PROJECTOR_TOKEN,
} from '@contexts/properties/application/ports/property-view-projector.port';
import { ProcessedEventEntity } from '@contexts/properties/infrastructure/persistence/mikroorm/entities/processed-event.entity';

import { ListingPriceChangedEnvelope } from './listing-price-changed.envelope';

const CONSUMER = 'property-view.listing-price-changed';

@Injectable()
export class ListingPriceChangedHandler {
  constructor(
    private readonly em: EntityManager,
    @Inject(PROPERTY_VIEW_PROJECTOR_TOKEN)
    private readonly projector: IPropertyViewProjector,
  ) {}

  async handle(event: ListingPriceChangedEnvelope): Promise<void> {
    await this.em.transactional(async (tx) => {
      // INSERT ... ON CONFLICT DO NOTHING: zero affected rows means already processed.
      const claim = await tx
        .createQueryBuilder(ProcessedEventEntity)
        .insert({ eventId: event.eventId, consumer: CONSUMER, processedAt: new Date() })
        .onConflict(['eventId', 'consumer'])
        .ignore()
        .execute('run');
      if (claim.affectedRows === 0) {
        return;
      }

      await this.projector.apply(tx, event); // projection writes share the transaction
    });
  }
}
