import { Migration } from '@mikro-orm/migrations';

import { generateUuidV7 } from '@house-radar/building-blocks';

/** Sources of listings. A `manual` source is seeded enabled, as manual import needs it from the first run. */
export class Migration20261125000107 extends Migration {
  override up(): void {
    this.addSql(`
      create table "ingestion"."source" (
        "id" text not null,
        "kind" text not null,
        "enabled" boolean not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "source_pkey" primary key ("id"),
        constraint "source_kind_check" check ("kind" in ('api', 'feed', 'manual'))
      );
    `);
    // The id is a freshly generated UUIDv7 (never user input), so inlining it is safe.
    this.addSql(
      `insert into "ingestion"."source" ("id", "kind", "enabled", "created_at", "updated_at")
       values ('${generateUuidV7()}', 'manual', true, now(), now());`,
    );
  }

  override down(): void {
    this.addSql('drop table if exists "ingestion"."source";');
  }
}
