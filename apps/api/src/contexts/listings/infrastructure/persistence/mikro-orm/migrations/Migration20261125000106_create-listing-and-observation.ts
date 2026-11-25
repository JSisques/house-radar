import { Migration } from '@mikro-orm/migrations';

export class Migration20261125000106 extends Migration {
  override up(): void {
    this.addSql(`
      create table "listings"."listing" (
        "id" uuid not null,
        "source_id" text not null,
        "external_id" text null,
        "url" text not null,
        "normalized_url" text not null,
        "property_type" text null,
        "condition" text null,
        "built_area_m2" numeric null,
        "usable_area_m2" numeric null,
        "plot_area_m2" numeric null,
        "bedrooms" int null,
        "bathrooms" int null,
        "year_built" int null,
        "has_garage" boolean null,
        "has_garden" boolean null,
        "has_pool" boolean null,
        "has_terrace" boolean null,
        "has_balcony" boolean null,
        "has_elevator" boolean null,
        "has_heating" boolean null,
        "energy_certificate" text null,
        "land_type" text null,
        "has_water" boolean null,
        "has_electricity" boolean null,
        "has_sanitation" boolean null,
        "title" text null,
        "description" text null,
        "current_price_cents" bigint null,
        "origins" jsonb not null default '{}',
        "status" text not null,
        "first_seen_at" timestamptz not null,
        "last_checked_at" timestamptz not null,
        "version" int not null default 1,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "listing_pkey" primary key ("id"),
        constraint "listing_status_check" check ("status" in ('active', 'disappeared', 'unknown')),
        constraint "listing_property_type_check" check ("property_type" is null or "property_type" in
          ('flat', 'penthouse', 'duplex', 'studio', 'detached_house', 'semi_detached_or_terraced_house', 'rustic_house', 'estate', 'land', 'other')),
        constraint "listing_condition_check" check ("condition" is null or "condition" in
          ('new_build', 'good_condition', 'to_renovate', 'unknown'))
      );
    `);
    this.addSql(
      `create unique index "listing_source_external_id_uq" on "listings"."listing" ("source_id", "external_id") where "external_id" is not null;`,
    );
    this.addSql(
      `create unique index "listing_manual_normalized_url_uq" on "listings"."listing" ("normalized_url") where "external_id" is null;`,
    );
    this.addSql(`
      create table "listings"."observation" (
        "id" uuid not null,
        "listing_id" uuid not null,
        "run_id" uuid null,
        "price_cents" bigint null,
        "price_origin" text null,
        "status" text not null,
        "observed_at" timestamptz not null,
        "snapshot" jsonb null,
        "version" int not null default 1,
        "created_at" timestamptz not null,
        constraint "observation_pkey" primary key ("id"),
        constraint "observation_listing_fk" foreign key ("listing_id") references "listings"."listing" ("id") on delete cascade,
        constraint "observation_status_check" check ("status" in ('active', 'disappeared', 'unknown'))
      );
    `);
    this.addSql(
      `create unique index "observation_listing_run_uq" on "listings"."observation" ("listing_id", "run_id") where "run_id" is not null;`,
    );
    this.addSql(
      `create index "observation_listing_observed_at_idx" on "listings"."observation" ("listing_id", "observed_at");`,
    );
  }

  override down(): void {
    this.addSql('drop table if exists "listings"."observation";');
    this.addSql('drop table if exists "listings"."listing";');
  }
}
