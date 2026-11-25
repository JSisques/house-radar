import { defineEntity, type EntityName, type InferEntity, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const SOURCE_ENTITY_NAME = 'SourceRow';
export const SOURCE_ENTITY = SOURCE_ENTITY_NAME as unknown as EntityName<SourceRow>;

export const SourceSchema = defineEntity({
  name: SOURCE_ENTITY_NAME,
  tableName: 'source',
  schema: 'ingestion',
  properties: {
    id: p.text().primary(),
    kind: p.text(),
    enabled: p.boolean(),
    createdAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type SourceRow = InferEntity<typeof SourceSchema>;
