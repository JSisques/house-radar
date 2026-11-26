import { Migration } from '@mikro-orm/migrations';

/**
 * The search read model (D19, D20) and the per-listing state it is computed from. `projected_listing` has no foreign
 * key to `property_listing`: its rows can arrive before the listing has a property, and both are rebuildable.
 * Location columns come with the location work, as the property does not model a location yet.
 */
export class Migration20261126000110 extends Migration {
  override up(): void {
    this.addSql(`
      create table "properties"."projected_listing" (
        "listing_id" uuid not null,
        "source" text null,
        "status" text null,
        "price_cents" bigint null,
        "state_observed_at" timestamptz null,
        "attributes" jsonb null,
        "attributes_observed_at" timestamptz null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "projected_listing_pkey" primary key ("listing_id")
      );
    `);
    this.addSql(`
      create table "properties"."property_search_view" (
        "property_id" uuid not null,
        "title" text null,
        "description" text null,
        "property_type" text null,
        "condition" text null,
        "built_area_m2" numeric(10,2) null,
        "usable_area_m2" numeric(10,2) null,
        "plot_area_m2" numeric(12,2) null,
        "bedrooms" int null,
        "bathrooms" int null,
        "year_built" int null,
        "features" jsonb not null default '{}',
        "conflicts" jsonb not null default '{}',
        "representative_price_cents" bigint null,
        "price_per_m2_cents" bigint null,
        "active_listing_count" int not null,
        "listing_count" int not null,
        "last_updated_at" timestamptz not null,
        constraint "property_search_view_pkey" primary key ("property_id"),
        constraint "property_search_view_property_id_fkey" foreign key ("property_id")
          references "properties"."property" ("id") on delete cascade
      );
    `);
    this.addSql(
      'create index "property_search_view_price_idx" on "properties"."property_search_view" ("representative_price_cents");',
    );
    this.addSql(
      'create index "property_search_view_type_idx" on "properties"."property_search_view" ("property_type");',
    );
  }

  override down(): void {
    this.addSql('drop table if exists "properties"."property_search_view";');
    this.addSql('drop table if exists "properties"."projected_listing";');
  }
}
