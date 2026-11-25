import { EntitySchema } from '@mikro-orm/core';

// Self-contained on purpose: MikroORM discovery loads this file natively, where aliased or extensionless imports do not resolve.
// Keep it identical to createProcessedEventSchema() in core/persistence/processed-event/processed-event.schema.ts.
export const ProcessedEventSchema = new EntitySchema({
  name: 'UsersProcessedEvent',
  schema: 'users',
  tableName: 'processed_event',
  properties: {
    eventId: { type: 'uuid', primary: true },
    consumer: { type: 'text', primary: true },
    processedAt: { type: 'Date', columnType: 'timestamptz' },
  },
});
