import type { EntityManager as CoreEntityManager } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import { generateUuidV7 } from '@house-radar/building-blocks';
import type { ListingId, PropertyId } from '@house-radar/shared-kernel';

import type { PropertyAggregate } from '@contexts/properties/domain/aggregates/property/property.aggregate';
import type { IPropertyWriteRepository } from '@contexts/properties/domain/repositories/write/property-write.repository';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import {
  PROPERTY_ENTITY,
  PROPERTY_LISTING_ENTITY,
  type PropertyListingRow,
  type PropertyRow,
} from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/property.schema';
import { OutboxWriteRepository } from '@core/persistence/outbox/outbox-write.repository.js';

/**
 * Stores properties. The property row has no state of its own, so a change to a listing's applied version touches
 * `updatedAt` to bump the property version and keep optimistic locking effective (D31).
 */
@Injectable()
export class PropertyMikroOrmWriteRepository
  extends OutboxWriteRepository<PropertyId, PropertyAggregate, PropertyRow>
  implements IPropertyWriteRepository
{
  constructor(
    @Inject(EntityManager) em: EntityManager,
    @Inject(PropertyRowMapper) private readonly mapper: PropertyRowMapper,
  ) {
    super(em, { entity: PROPERTY_ENTITY, outboxSchema: 'properties', aggregateType: 'Property' });
  }

  override async findById(id: PropertyId): Promise<PropertyAggregate | null> {
    return this.findWithListings({ id: id.value });
  }

  async findByListingId(listingId: ListingId): Promise<PropertyAggregate | null> {
    const link = await this.em
      .fork()
      .findOne<PropertyListingRow>(PROPERTY_LISTING_ENTITY, { listingId: listingId.value });
    return link === null ? null : this.findWithListings({ id: link.property.id });
  }

  private async findWithListings(where: { id: string }): Promise<PropertyAggregate | null> {
    const row = await this.em.fork().findOne<PropertyRow, 'listings'>(PROPERTY_ENTITY, where, {
      populate: ['listings'],
    });
    return row === null ? null : this.toAggregate(row);
  }

  protected toRow(aggregate: PropertyAggregate): Omit<PropertyRow, 'version' | 'createdAt' | 'updatedAt'> {
    return this.mapper.toRow(aggregate);
  }

  protected toAggregate(row: PropertyRow): PropertyAggregate {
    return this.mapper.toAggregate(row);
  }

  protected override async syncChildRows(
    em: CoreEntityManager,
    row: PropertyRow,
    aggregate: PropertyAggregate,
  ): Promise<void> {
    if (!row.listings.isInitialized()) await row.listings.init();
    let changed = false;
    for (const { listingId, version } of aggregate.toPrimitives().listings) {
      const existing = row.listings.getItems().find((listing) => listing.listingId === listingId);
      if (existing === undefined) {
        em.create(PROPERTY_LISTING_ENTITY, {
          id: generateUuidV7(),
          property: row,
          listingId,
          appliedVersion: version,
        } as never);
        changed = true;
      } else if (existing.appliedVersion !== version) {
        existing.appliedVersion = version;
        changed = true;
      }
    }
    if (changed && !aggregate.isNew()) row.updatedAt = new Date();
  }
}
