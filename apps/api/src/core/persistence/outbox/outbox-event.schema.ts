import { EntitySchema } from '@mikro-orm/core';

/** Contexts that emit events and therefore own an `outbox_event` table (D31). */
export const OUTBOX_CONTEXTS = ['ingestion', 'listings', 'properties', 'identity'] as const;

export type OutboxContext = (typeof OUTBOX_CONTEXTS)[number];

export interface OutboxEventRow {
  id: string;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  eventType: string;
  schemaVersion: number;
  payload: Record<string, unknown>;
  metadata: { correlationId: string; causationId: string | null };
  occurredAt: Date;
  publishedAt: Date | null;
}

/** Entity names must be unique in one ORM, so each context gets its own (for example `ListingsOutboxEvent`). */
export function outboxEventEntityName(context: OutboxContext): string {
  return `${context.charAt(0).toUpperCase()}${context.slice(1)}OutboxEvent`;
}

/** Maps the context's `outbox_event` table. Each context declares it in its own `schemas/` folder. */
export function createOutboxEventSchema(context: OutboxContext): EntitySchema<OutboxEventRow> {
  return new EntitySchema<OutboxEventRow>({
    name: outboxEventEntityName(context),
    schema: context,
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
}
