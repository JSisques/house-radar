import type { EntityManager as CoreEntityManager } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { ListingId } from '@house-radar/shared-kernel';

import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import type { IListingWriteRepository } from '@contexts/listings/domain/repositories/write/listing-write.repository';
import { ListingRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/listing-row/listing-row.mapper';
import {
  LISTING_ENTITY,
  type ListingRow,
} from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/listing.schema';
import { OutboxWriteRepository } from '@core/persistence/outbox/outbox-write.repository.js';

/**
 * Stores listings. A new aggregate whose (source, external id) already exists updates that row and keeps its id
 * (HR-F001-AC3), so re-ingesting an advertisement never creates a second listing (D23).
 */
@Injectable()
export class ListingMikroOrmWriteRepository
  extends OutboxWriteRepository<ListingId, ListingAggregate, ListingRow>
  implements IListingWriteRepository
{
  constructor(
    @Inject(EntityManager) em: EntityManager,
    @Inject(ListingRowMapper) private readonly mapper: ListingRowMapper,
  ) {
    super(em, { entity: LISTING_ENTITY, outboxSchema: 'listings', aggregateType: 'Listing' });
  }

  protected toRow(aggregate: ListingAggregate): Omit<ListingRow, 'version' | 'createdAt' | 'updatedAt'> {
    return this.mapper.toRow(aggregate);
  }

  protected toAggregate(row: ListingRow): ListingAggregate {
    return this.mapper.toAggregate(row);
  }

  protected override async findRowByNaturalKey(
    em: CoreEntityManager,
    aggregate: ListingAggregate,
  ): Promise<ListingRow | null> {
    if (aggregate.externalId === undefined) return null;
    return em.findOne<ListingRow>(LISTING_ENTITY, {
      sourceId: aggregate.source.value,
      externalId: aggregate.externalId.value,
    });
  }
}
