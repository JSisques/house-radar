import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import type { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';
import {
  PROPERTY_ENTITY,
  PROPERTY_LISTING_ENTITY,
  type PropertyListingRow,
  type PropertyRow,
} from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/property.schema';
import { PROJECTED_LISTING_ENTITY } from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/property-search-view.schema';

/**
 * Stores the per-listing state in `properties.projected_listing`. Price and status are replaced only by an observation
 * at least as recent as the stored one, and the attributes only by a check at least as recent, so a late event never
 * overwrites newer data and a replay is harmless. The writes run in the ambient transaction.
 *
 * The two writes are SQL on purpose: each column group decides in the database, in one atomic statement, whether the
 * event is newer than the stored state. With the ORM that is a read followed by a write, and two events of one listing
 * could both insert the first row. Reads go through the ORM, refreshed so they see what the transaction just wrote.
 */
@Injectable()
export class ProjectedListingMikroOrmRepository implements IProjectedListingRepository {
  constructor(@Inject(EntityManager) private readonly em: EntityManager) {}

  async applyImported(command: ProjectListingImportedCommand): Promise<void> {
    await this.em.execute(
      `insert into "properties"."projected_listing"
         ("listing_id", "source", "status", "price_cents", "state_observed_at", "attributes", "attributes_observed_at",
          "created_at", "updated_at")
       values (?, ?, ?, ?, ?, ?::jsonb, ?, now(), now())
       on conflict ("listing_id") do update set
         "source" = case when "projected_listing"."attributes_observed_at" is null
                           or excluded."attributes_observed_at" >= "projected_listing"."attributes_observed_at"
                         then excluded."source" else "projected_listing"."source" end,
         "attributes" = case when "projected_listing"."attributes_observed_at" is null
                               or excluded."attributes_observed_at" >= "projected_listing"."attributes_observed_at"
                             then excluded."attributes" else "projected_listing"."attributes" end,
         "attributes_observed_at" = greatest("projected_listing"."attributes_observed_at", excluded."attributes_observed_at"),
         "status" = case when "projected_listing"."state_observed_at" is null
                           or excluded."state_observed_at" >= "projected_listing"."state_observed_at"
                         then excluded."status" else "projected_listing"."status" end,
         "price_cents" = case when "projected_listing"."state_observed_at" is null
                                or excluded."state_observed_at" >= "projected_listing"."state_observed_at"
                              then excluded."price_cents" else "projected_listing"."price_cents" end,
         "state_observed_at" = greatest("projected_listing"."state_observed_at", excluded."state_observed_at"),
         "updated_at" = now()`,
      [
        command.listingId,
        command.source,
        command.status,
        command.priceCents,
        command.observedAt,
        JSON.stringify(command.attributes),
        command.observedAt,
      ],
    );
  }

  async applyObserved(command: ProjectListingObservedCommand): Promise<void> {
    await this.em.execute(
      `insert into "properties"."projected_listing"
         ("listing_id", "status", "price_cents", "state_observed_at", "created_at", "updated_at")
       values (?, ?, ?, ?, now(), now())
       on conflict ("listing_id") do update set
         "status" = case when "projected_listing"."state_observed_at" is null
                           or excluded."state_observed_at" >= "projected_listing"."state_observed_at"
                         then excluded."status" else "projected_listing"."status" end,
         "price_cents" = case when "projected_listing"."state_observed_at" is null
                                or excluded."state_observed_at" >= "projected_listing"."state_observed_at"
                              then excluded."price_cents" else "projected_listing"."price_cents" end,
         "state_observed_at" = greatest("projected_listing"."state_observed_at", excluded."state_observed_at"),
         "updated_at" = now()`,
      [command.listingId, command.status, command.priceCents, command.observedAt],
    );
  }

  async findPropertyIdOf(listingId: string): Promise<string | null> {
    const link = await this.em.findOne<PropertyListingRow>(PROPERTY_LISTING_ENTITY, { listingId }, { refresh: true });
    return link?.property.id ?? null;
  }

  async findByProperty(propertyId: string): Promise<IProjectedListingProps[]> {
    const links = await this.em.find<PropertyListingRow>(
      PROPERTY_LISTING_ENTITY,
      { property: propertyId },
      { refresh: true },
    );
    if (links.length === 0) return [];

    const rows = await this.em.find(
      PROJECTED_LISTING_ENTITY,
      { listingId: { $in: links.map((link) => link.listingId) } },
      { refresh: true },
    );
    return rows.map((row) => ({
      listingId: row.listingId,
      source: row.source,
      status: row.status,
      priceCents: row.priceCents,
      attributes: row.attributes,
      attributesObservedAt: row.attributesObservedAt,
    }));
  }

  async listPropertyIds(): Promise<string[]> {
    const properties = await this.em.find<PropertyRow>(PROPERTY_ENTITY, {}, { orderBy: { id: 'asc' } });
    return properties.map((property) => property.id);
  }
}
