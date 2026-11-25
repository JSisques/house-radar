import type { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import { type Criteria, FilterFieldRegistry, PaginatedResult } from '@house-radar/building-blocks';
import type { ListingId } from '@house-radar/shared-kernel';

import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';
import type { IListingReadRepository } from '@contexts/listings/domain/repositories/read/listing-read.repository';
import { ListingRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/listing-row/listing-row.mapper';
import {
  LISTING_ENTITY,
  type ListingRow,
} from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/listing.schema';
import { translateCriteria } from '@core/persistence/criteria/criteria-translator/criteria-translator.js';

const DEFAULT_PAGE_SIZE = 20;

/** Public field name -> row property. */
const COLUMNS: Readonly<Record<string, keyof ListingRow>> = {
  source: 'sourceId',
  externalId: 'externalId',
  status: 'status',
  addedAt: 'firstSeenAt',
  lastCheckedAt: 'lastCheckedAt',
};

const FIELDS = new FilterFieldRegistry({
  source: ['eq', 'neq', 'in'],
  externalId: ['eq', 'in'],
  status: ['eq', 'neq', 'in'],
  addedAt: ['eq', 'gt', 'gte', 'lt', 'lte'],
  lastCheckedAt: ['eq', 'gt', 'gte', 'lt', 'lte'],
});

/** Minimal read side of the listings table. It returns primitives, never aggregates. */
@Injectable()
export class ListingMikroOrmReadRepository implements IListingReadRepository {
  constructor(
    @Inject(EntityManager) private readonly em: EntityManager,
    @Inject(ListingRowMapper) private readonly mapper: ListingRowMapper,
  ) {}

  async findById(id: ListingId): Promise<IListingPrimitives | null> {
    const row = await this.em.fork().findOne<ListingRow>(LISTING_ENTITY, { id: id.value });
    return row === null ? null : this.mapper.toAggregate(row).toPrimitives();
  }

  async findByCriteria(criteria: Criteria): Promise<PaginatedResult<IListingPrimitives>> {
    FIELDS.assertAllowed(criteria);
    const { where, orderBy, limit, offset } = translateCriteria(criteria, COLUMNS, DEFAULT_PAGE_SIZE);

    const [rows, total] = await this.em
      .fork()
      .findAndCount<ListingRow>(LISTING_ENTITY, where as FilterQuery<ListingRow>, {
        orderBy: orderBy.length > 0 ? orderBy : [{ firstSeenAt: 'asc' }, { id: 'asc' }],
        limit,
        offset,
      });
    return new PaginatedResult(
      rows.map((row) => this.mapper.toAggregate(row).toPrimitives()),
      total,
      Math.floor(offset / limit) + 1,
      limit,
    );
  }
}
