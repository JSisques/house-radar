import type { EntityManager, FilterQuery } from '@mikro-orm/core';

import { type Criteria, FilterFieldRegistry, type FilterOperator, PaginatedResult } from '@house-radar/building-blocks';
import type { ListingId } from '@house-radar/shared-kernel';

import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';
import type { IListingReadRepository } from '@contexts/listings/domain/repositories/read/listing-read.repository';
import { ListingRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/listing-row.mapper';
import {
  LISTING_ENTITY,
  type ListingRow,
} from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/listing.schema';

const DEFAULT_PAGE_SIZE = 20;

/** Public field name -> row property. */
const COLUMNS: Readonly<Record<string, keyof ListingRow>> = {
  source: 'sourceId',
  externalId: 'externalId',
  status: 'status',
  addedAt: 'firstSeenAt',
  lastCheckedAt: 'lastCheckedAt',
};

const MIKRO_ORM_OPERATORS: Readonly<Record<FilterOperator, string>> = {
  eq: '$eq',
  neq: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  contains: '$like',
};

const FIELDS = new FilterFieldRegistry({
  source: ['eq', 'neq', 'in'],
  externalId: ['eq', 'in'],
  status: ['eq', 'neq', 'in'],
  addedAt: ['eq', 'gt', 'gte', 'lt', 'lte'],
  lastCheckedAt: ['eq', 'gt', 'gte', 'lt', 'lte'],
});

/** Minimal read side of the listings table. It returns primitives, never aggregates. */
export class ListingMikroOrmReadRepository implements IListingReadRepository {
  private readonly mapper = new ListingRowMapper();

  constructor(private readonly em: EntityManager) {}

  async findById(id: ListingId): Promise<IListingPrimitives | null> {
    const row = await this.em.fork().findOne<ListingRow>(LISTING_ENTITY, { id: id.value });
    return row === null ? null : this.mapper.toAggregate(row).toPrimitives();
  }

  async findByCriteria(criteria: Criteria): Promise<PaginatedResult<IListingPrimitives>> {
    FIELDS.assertAllowed(criteria);
    const where: Record<string, Record<string, unknown>> = {};
    for (const { field, operator, value } of criteria.filters) {
      const column = COLUMNS[field] as string;
      const matched = operator === 'contains' ? `%${String(value)}%` : value;
      where[column] = { ...where[column], [MIKRO_ORM_OPERATORS[operator]]: matched };
    }
    const orderBy = criteria.sorts.map(({ field, direction }) => ({ [COLUMNS[field] as string]: direction }));
    const page = criteria.pagination?.page ?? 1;
    const pageSize = criteria.pagination?.pageSize ?? DEFAULT_PAGE_SIZE;

    const [rows, total] = await this.em
      .fork()
      .findAndCount<ListingRow>(LISTING_ENTITY, where as FilterQuery<ListingRow>, {
        orderBy: orderBy.length > 0 ? orderBy : [{ firstSeenAt: 'asc' }, { id: 'asc' }],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    return new PaginatedResult(
      rows.map((row) => this.mapper.toAggregate(row).toPrimitives()),
      total,
      page,
      pageSize,
    );
  }
}
