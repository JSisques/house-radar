import { EntitySchema } from '@mikro-orm/core';

/** Contexts that consume events and therefore own a `processed_event` table (D31). */
export const PROCESSED_EVENT_CONTEXTS = ['properties', 'users'] as const;

export type ProcessedEventContext = (typeof PROCESSED_EVENT_CONTEXTS)[number];

export interface ProcessedEventRow {
  eventId: string;
  consumer: string;
  processedAt: Date;
}

/** Maps the context's `processed_event` table. Each context declares it in its own `schemas/` folder. */
export function createProcessedEventSchema(context: ProcessedEventContext): EntitySchema<ProcessedEventRow> {
  return new EntitySchema<ProcessedEventRow>({
    name: `${context.charAt(0).toUpperCase()}${context.slice(1)}ProcessedEvent`,
    schema: context,
    tableName: 'processed_event',
    properties: {
      eventId: { type: 'uuid', primary: true },
      consumer: { type: 'text', primary: true },
      processedAt: { type: 'Date', columnType: 'timestamptz' },
    },
  });
}
