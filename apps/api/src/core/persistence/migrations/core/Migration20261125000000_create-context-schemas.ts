import { Migration } from '@mikro-orm/migrations';

// Frozen on purpose: a migration must not change when the shared list of contexts does.
const SCHEMAS = ['ingestion', 'listings', 'properties', 'geography', 'identity', 'users'];

/** Enables PostGIS and creates every context schema, so each context stream can keep its tracking table inside its own schema. */
export class Migration20261125000000 extends Migration {
  override up(): void {
    this.addSql('create extension if not exists postgis;');
    for (const schema of SCHEMAS) this.addSql(`create schema if not exists "${schema}";`);
  }

  override down(): void {
    for (const schema of [...SCHEMAS].reverse()) this.addSql(`drop schema if exists "${schema}" cascade;`);
  }
}
