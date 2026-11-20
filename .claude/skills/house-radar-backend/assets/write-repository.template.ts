// Path: src/contexts/<context>/infrastructure/persistence/mikroorm/repositories/<name>-mikroorm-write.repository.ts
// Implements the domain write port. Saving the aggregate and writing its events to the outbox
// happen in ONE transaction: either both are stored or neither (D31). Never publish from here.
//
// Rules shown here:
// - Updates go through the MANAGED entity (load + assign), never a fresh `new` entity:
//   persisting a new object for an existing row would be an INSERT.
// - Optimistic locking (D23): the load checks the version the aggregate was read with;
//   a concurrent change raises OptimisticLockError and the command is retried.
// - Events are cleared and the version synced (`markPersisted`) only AFTER the commit: if the
//   transaction fails, the aggregate keeps its events and its read version. The repository
//   integration spec (Testcontainers) asserts it: a forced failure leaves no listing row, no
//   outbox row, and the events still on the aggregate.
import { Injectable } from '@nestjs/common';
import { EntityManager, LockMode } from '@mikro-orm/postgresql';

import { ListingId } from '@house-radar/shared-kernel';

import { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import { IListingWriteRepository } from '@contexts/listings/domain/repositories/write/listing-write.repository';
import { ListingEntity } from '@contexts/listings/infrastructure/persistence/mikroorm/entities/listing.entity';
import { ListingMikroormMapper } from '@contexts/listings/infrastructure/persistence/mikroorm/mappers/listing-mikroorm.mapper';
import { OutboxEventMapper } from '@contexts/listings/infrastructure/persistence/mikroorm/mappers/outbox-event.mapper';

@Injectable()
export class ListingMikroormWriteRepository implements IListingWriteRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ListingMikroormMapper,
    private readonly outboxEventMapper: OutboxEventMapper,
  ) {}

  async save(listing: ListingAggregate): Promise<void> {
    const events = listing.peekDomainEvents();

    const persisted = await this.em.transactional(async (tx) => {
      const existing = listing.isNew()
        ? null
        : await tx.findOneOrFail(ListingEntity, listing.id.value, {
            lockMode: LockMode.OPTIMISTIC,
            lockVersion: listing.version,
          });

      const entity = existing
        ? tx.assign(existing, this.mapper.toEntityData(listing))
        : tx.create(ListingEntity, this.mapper.toEntityData(listing));
      tx.persist(entity);

      for (const event of events) {
        tx.persist(this.outboxEventMapper.toEntity(tx, event, 'Listing'));
      }
      return entity;
    }); // commit: aggregate row + outbox rows together, or rollback of both

    // Only after commit: sync the version bumped by the database (a second save of the same
    // instance must not fail the optimistic lock) and drop the events now stored in the outbox.
    listing.markPersisted(persisted.version);
    listing.clearDomainEvents();
  }

  async findById(id: ListingId): Promise<ListingAggregate | null> {
    const entity = await this.em.findOne(ListingEntity, id.value);
    return entity ? this.mapper.toAggregate(entity) : null;
  }

  async delete(id: ListingId): Promise<void> {
    await this.em.nativeDelete(ListingEntity, { id: id.value });
  }
}
