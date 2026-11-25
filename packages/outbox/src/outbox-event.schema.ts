import { defineEntity, type InferEntity, p } from '@mikro-orm/core';

/** Contexts that emit events and therefore own an `outbox_event` table (D31). */
export const OUTBOX_CONTEXTS = ['ingestion', 'listings', 'properties', 'identity'] as const;

export type OutboxContext = (typeof OUTBOX_CONTEXTS)[number];

/** Entity names must be unique in one ORM, so each context gets its own (for example `ListingsOutboxEvent`). */
export function outboxEventEntityName(context: OutboxContext): string {
  return `${context.charAt(0).toUpperCase()}${context.slice(1)}OutboxEvent`;
}

/** Maps the context's `outbox_event` table. Each context declares it in its own `schemas/` folder. */
export function createOutboxEventSchema(context: OutboxContext) {
  return defineEntity({
    name: outboxEventEntityName(context),
    schema: context,
    tableName: 'outbox_event',
    properties: {
      id: p.uuid().primary(),
      aggregateType: p.text(),
      aggregateId: p.uuid(),
      aggregateVersion: p.integer(),
      eventType: p.text(),
      schemaVersion: p.integer(),
      payload: p.json<Record<string, unknown>>().columnType('jsonb'),
      metadata: p.json<{ correlationId: string; causationId: string | null }>().columnType('jsonb'),
      occurredAt: p.datetime().columnType('timestamptz'),
      publishedAt: p.datetime().columnType('timestamptz').strictNullable(),
    },
  });
}

export type OutboxEventRow = InferEntity<ReturnType<typeof createOutboxEventSchema>>;
