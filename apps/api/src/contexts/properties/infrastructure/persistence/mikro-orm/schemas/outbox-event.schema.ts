import { EntitySchema } from '@mikro-orm/core';

// Self-contained on purpose: MikroORM discovery loads this file natively, where aliased or extensionless imports do not resolve.
// Keep it identical to createOutboxEventSchema() in packages/outbox/src/outbox-event.schema.ts.
export const OutboxEventSchema = new EntitySchema({
  name: 'PropertiesOutboxEvent',
  schema: 'properties',
  tableName: 'outbox_event',
  properties: {
    id: { type: 'uuid', primary: true },
    aggregateType: { type: 'text' },
    aggregateId: { type: 'uuid' },
    aggregateVersion: { type: 'integer' },
    eventType: { type: 'text' },
    schemaVersion: { type: 'integer' },
    payload: { type: 'json', columnType: 'jsonb' },
    metadata: { type: 'json', columnType: 'jsonb' },
    occurredAt: { type: 'Date', columnType: 'timestamptz' },
    publishedAt: { type: 'Date', columnType: 'timestamptz', nullable: true },
  },
});
