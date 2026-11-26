import { Migration } from '@mikro-orm/migrations';

/**
 * Property and the listings it groups. A listing belongs to exactly one property (unique `listing_id`), and
 * `applied_version` keeps the newest event version applied for it so late events can be ignored (D31).
 * `chosen_location` comes with the location work, as it is not modeled by the aggregate yet.
 */
export class Migration20261125000109 extends Migration {
  override up(): void {
    this.addSql(`
      create table "properties"."property" (
        "id" uuid not null,
        "version" int not null default 1,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "property_pkey" primary key ("id")
      );
    `);
    this.addSql(`
      create table "properties"."property_listing" (
        "id" uuid not null,
        "property_id" uuid not null,
        "listing_id" uuid not null,
        "applied_version" int not null,
        "created_at" timestamptz not null,
        constraint "property_listing_pkey" primary key ("id"),
        constraint "property_listing_property_id_fkey" foreign key ("property_id")
          references "properties"."property" ("id") on delete cascade,
        constraint "property_listing_listing_id_key" unique ("listing_id")
      );
    `);
    this.addSql('create index "property_listing_property_id_idx" on "properties"."property_listing" ("property_id");');
  }

  override down(): void {
    this.addSql('drop table if exists "properties"."property_listing";');
    this.addSql('drop table if exists "properties"."property";');
  }
}
