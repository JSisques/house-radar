import { defineEntity, type InferEntity, p } from '@mikro-orm/core';

/** Contexts that consume events and therefore own a `processed_event` table (D31). */
export const PROCESSED_EVENT_CONTEXTS = ['properties', 'users'] as const;

export type ProcessedEventContext = (typeof PROCESSED_EVENT_CONTEXTS)[number];

/** Maps the context's `processed_event` table. Each context declares it in its own `schemas/` folder. */
export function createProcessedEventSchema(context: ProcessedEventContext) {
  return defineEntity({
    name: `${context.charAt(0).toUpperCase()}${context.slice(1)}ProcessedEvent`,
    schema: context,
    tableName: 'processed_event',
    properties: {
      eventId: p.uuid().primary(),
      consumer: p.text().primary(),
      processedAt: p.datetime().columnType('timestamptz'),
    },
  });
}

export type ProcessedEventRow = InferEntity<ReturnType<typeof createProcessedEventSchema>>;
