import { defineEntity, type EntityName, type InferEntity, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const OBSERVATION_ENTITY_NAME = 'ObservationRow';
/** The name typed as an entity reference, as outboxEventEntityName does for the outbox table. */
export const OBSERVATION_ENTITY = OBSERVATION_ENTITY_NAME as unknown as EntityName<ObservationRow>;

export const ObservationSchema = defineEntity({
  name: OBSERVATION_ENTITY_NAME,
  tableName: 'observation',
  schema: 'listings',
  properties: {
    id: p.uuid().primary(),
    listingId: p.uuid(),
    runId: p.uuid().strictNullable(),
    priceCents: p.bigint().strictNullable(),
    priceOrigin: p.text().strictNullable(),
    status: p.text(),
    observedAt: p.datetime().columnType('timestamptz'),
    snapshot: p.json<Record<string, unknown>>().columnType('jsonb').strictNullable(),
    version: p.integer().version(),
    createdAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date()),
  },
});

export type ObservationRow = InferEntity<typeof ObservationSchema>;
