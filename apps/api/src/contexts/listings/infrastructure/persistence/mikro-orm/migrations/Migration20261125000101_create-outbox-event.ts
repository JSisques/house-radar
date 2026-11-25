import { Migration } from '@mikro-orm/migrations';

/** Transactional outbox (D31): events are stored with the aggregate and published later by the relay. */
export class Migration20261125000101 extends Migration {
  override up(): void {
    this.addSql(`
      create table "listings"."outbox_event" (
        "id" uuid not null,
        "aggregate_type" text not null,
        "aggregate_id" uuid not null,
        "aggregate_version" int not null,
        "event_type" text not null,
        "schema_version" int not null,
        "payload" jsonb not null,
        "metadata" jsonb not null,
        "occurred_at" timestamptz not null,
        "published_at" timestamptz null,
        constraint "outbox_event_pkey" primary key ("id")
      );
    `);
    this.addSql(
      'create index "outbox_event_unpublished_idx" on "listings"."outbox_event" ("occurred_at") where "published_at" is null;',
    );
  }

  override down(): void {
    this.addSql('drop table if exists "listings"."outbox_event";');
  }
}
