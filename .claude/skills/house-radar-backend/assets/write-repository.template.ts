// Path: src/contexts/<context>/infrastructure/persistence/mikroorm/repositories/<name>-mikroorm-write.repository.ts
// Implements the domain write port. Saving the aggregate and writing its events to the outbox
// happen in ONE transaction: either both are stored or neither (D31). Never publish from here.
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import { ListingId } from '@house-radar/shared-kernel';

import { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import { IListingWriteRepository } from '@contexts/listings/domain/repositories/write/listing-write.repository';
import { ListingEntity } from '@contexts/listings/infrastructure/persistence/mikroorm/entities/listing.entity';
import { OutboxEventEntity } from '@contexts/listings/infrastructure/persistence/mikroorm/entities/outbox-event.entity';
import { ListingMikroormMapper } from '@contexts/listings/infrastructure/persistence/mikroorm/mappers/listing-mikroorm.mapper';

@Injectable()
export class ListingMikroormWriteRepository implements IListingWriteRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ListingMikroormMapper,
  ) {}

  async save(listing: ListingAggregate): Promise<void> {
    await this.em.transactional(async (tx) => {
      // Aggregate state through the mapper (Data Mapper + unit of work, D6).
      tx.persist(this.mapper.toEntity(listing));

      // Pull inside the transaction: events are drained only if we got this far.
      for (const event of listing.pullDomainEvents()) {
        tx.persist(
          tx.create(OutboxEventEntity, {
            id: event.metadata.eventId, // UUIDv7 (D32)
            aggregateType: 'Listing',
            aggregateId: listing.id.value,
            eventType: event.metadata.eventType,
            schemaVersion: event.metadata.schemaVersion,
            payload: event.data,
            metadata: { correlationId: event.metadata.correlationId, causationId: event.metadata.causationId },
            occurredAt: event.metadata.occurredAt,
            publishedAt: null, // the outbox relay sets it after publishing through BullMQ
          }),
        );
      }
    }); // flushes on commit; any failure rolls back aggregate and events together
  }

  async findById(id: ListingId): Promise<ListingAggregate | null> {
    const entity = await this.em.findOne(ListingEntity, { id: id.value });
    return entity ? this.mapper.toAggregate(entity) : null;
  }

  async delete(id: ListingId): Promise<void> {
    await this.em.nativeDelete(ListingEntity, { id: id.value });
  }
}
