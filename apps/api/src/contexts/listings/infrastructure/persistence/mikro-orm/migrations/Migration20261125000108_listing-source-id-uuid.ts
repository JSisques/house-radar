import { Migration } from '@mikro-orm/migrations';

/** A source is now identified by a UUIDv7 (see `ingestion.source`), so the listing reference becomes `uuid` too. */
export class Migration20261125000108 extends Migration {
  override up(): void {
    this.addSql('alter table "listings"."listing" alter column "source_id" type uuid using "source_id"::uuid;');
  }

  override down(): void {
    this.addSql('alter table "listings"."listing" alter column "source_id" type text using "source_id"::text;');
  }
}
