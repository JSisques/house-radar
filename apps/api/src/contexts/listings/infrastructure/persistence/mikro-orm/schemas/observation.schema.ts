import { type EntityName, EntitySchema } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

export interface ObservationRow {
  id: string;
  listingId: string;
  runId: string | null;
  priceCents: bigint | null;
  priceOrigin: string | null;
  status: string;
  observedAt: Date;
  snapshot: Record<string, unknown> | null;
  version: number;
  createdAt?: Date;
}

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const OBSERVATION_ENTITY_NAME = 'ObservationRow';
/** The name typed as an entity reference, as outboxEventEntityName does for the outbox table. */
export const OBSERVATION_ENTITY = OBSERVATION_ENTITY_NAME as unknown as EntityName<ObservationRow>;

export const ObservationSchema = new EntitySchema<ObservationRow>({
  name: OBSERVATION_ENTITY_NAME,
  tableName: 'observation',
  schema: 'listings',
  properties: {
    id: { type: 'uuid', primary: true },
    listingId: { type: 'uuid' },
    runId: { type: 'uuid', nullable: true },
    priceCents: { type: 'bigint', nullable: true },
    priceOrigin: { type: 'string', columnType: 'text', nullable: true },
    status: { type: 'string', columnType: 'text' },
    observedAt: { type: 'Date', columnType: 'timestamptz' },
    snapshot: { type: 'json', columnType: 'jsonb', nullable: true },
    version: { type: 'integer', version: true },
    createdAt: { type: 'Date', columnType: 'timestamptz', onCreate: () => new Date() },
  },
});
