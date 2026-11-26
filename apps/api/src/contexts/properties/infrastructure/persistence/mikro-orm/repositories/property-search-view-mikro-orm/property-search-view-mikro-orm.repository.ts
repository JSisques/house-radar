import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { IPropertySearchViewRepository } from '@contexts/properties/application/ports/property-search-view-repository.port';
import type { IPropertySearchViewPrimitives } from '@contexts/properties/domain/primitives/property-search-view.primitives';

/** Upserts the view of a property into `properties.property_search_view`, in the ambient transaction. */
@Injectable()
export class PropertySearchViewMikroOrmRepository implements IPropertySearchViewRepository {
  constructor(@Inject(EntityManager) private readonly em: EntityManager) {}

  async save(view: IPropertySearchViewPrimitives): Promise<void> {
    await this.em.execute(
      `insert into "properties"."property_search_view"
         ("property_id", "title", "description", "property_type", "condition", "built_area_m2", "usable_area_m2",
          "plot_area_m2", "bedrooms", "bathrooms", "year_built", "features", "conflicts",
          "representative_price_cents", "price_per_m2_cents", "active_listing_count", "listing_count",
          "last_updated_at")
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?, now())
       on conflict ("property_id") do update set
         "title" = excluded."title",
         "description" = excluded."description",
         "property_type" = excluded."property_type",
         "condition" = excluded."condition",
         "built_area_m2" = excluded."built_area_m2",
         "usable_area_m2" = excluded."usable_area_m2",
         "plot_area_m2" = excluded."plot_area_m2",
         "bedrooms" = excluded."bedrooms",
         "bathrooms" = excluded."bathrooms",
         "year_built" = excluded."year_built",
         "features" = excluded."features",
         "conflicts" = excluded."conflicts",
         "representative_price_cents" = excluded."representative_price_cents",
         "price_per_m2_cents" = excluded."price_per_m2_cents",
         "active_listing_count" = excluded."active_listing_count",
         "listing_count" = excluded."listing_count",
         "last_updated_at" = now()`,
      [
        view.propertyId,
        view.title,
        view.description,
        view.propertyType,
        view.condition,
        view.builtAreaM2,
        view.usableAreaM2,
        view.plotAreaM2,
        view.bedrooms,
        view.bathrooms,
        view.yearBuilt,
        JSON.stringify(view.features),
        JSON.stringify(view.conflicts),
        view.representativePriceCents,
        view.pricePerM2Cents,
        view.activeListingCount,
        view.listingCount,
      ],
    );
  }
}
