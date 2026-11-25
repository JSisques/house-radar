import { defineEntity, p } from '@mikro-orm/core';

// Self-contained on purpose: MikroORM discovery loads this file natively, where aliased or extensionless imports do not resolve.
// Keep it identical to createProcessedEventSchema() in core/persistence/processed-event/processed-event.schema.ts.
export const ProcessedEventSchema = defineEntity({
  name: 'PropertiesProcessedEvent',
  schema: 'properties',
  tableName: 'processed_event',
  properties: {
    eventId: p.uuid().primary(),
    consumer: p.text().primary(),
    processedAt: p.datetime().columnType('timestamptz'),
  },
});
