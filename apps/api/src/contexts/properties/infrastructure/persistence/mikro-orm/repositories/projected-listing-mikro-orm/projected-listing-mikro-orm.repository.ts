import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import type { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

interface IProjectedListingRow {
  listing_id: string;
  source: string | null;
  status: string | null;
  price_cents: number | null;
  attributes: ListingAttributes | null;
  attributes_observed_at: Date | null;
}

/**
 * Stores the per-listing state in `properties.projected_listing`. Price and status are replaced only by an observation
 * at least as recent as the stored one, and the attributes only by a check at least as recent, so a late event never
 * overwrites newer data and a replay is harmless. The writes run in the ambient transaction.
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
    const rows = await this.em.execute<{ property_id: string }[]>(
      'select "property_id" from "properties"."property_listing" where "listing_id" = ?',
      [listingId],
    );
    return rows[0]?.property_id ?? null;
  }

  async findByProperty(propertyId: string): Promise<IProjectedListingProps[]> {
    const rows = await this.em.execute<IProjectedListingRow[]>(
      `select l."listing_id", l."source", l."status", l."price_cents"::float8 as "price_cents", l."attributes",
              l."attributes_observed_at"
         from "properties"."property_listing" link
         join "properties"."projected_listing" l on l."listing_id" = link."listing_id"
        where link."property_id" = ?`,
      [propertyId],
    );
    return rows.map((row) => ({
      listingId: row.listing_id,
      source: row.source,
      status: row.status,
      priceCents: row.price_cents,
      attributes: row.attributes,
      attributesObservedAt: row.attributes_observed_at === null ? null : new Date(row.attributes_observed_at),
    }));
  }

  async listPropertyIds(): Promise<string[]> {
    const rows = await this.em.execute<{ id: string }[]>('select "id" from "properties"."property" order by "id"');
    return rows.map((row) => row.id);
  }
}
