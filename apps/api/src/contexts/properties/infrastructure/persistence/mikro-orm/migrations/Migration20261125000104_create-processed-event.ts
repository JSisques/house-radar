import { Migration } from '@mikro-orm/migrations';

/** Idempotent consumers (D31): a consumer claims (event_id, consumer) and skips events it already processed. */
export class Migration20261125000104 extends Migration {
  override up(): void {
    this.addSql(`
      create table "properties"."processed_event" (
        "event_id" uuid not null,
        "consumer" text not null,
        "processed_at" timestamptz not null,
        constraint "processed_event_pkey" primary key ("event_id", "consumer")
      );
    `);
  }

  override down(): void {
    this.addSql('drop table if exists "properties"."processed_event";');
  }
}
