import { defineConfig, MikroORM } from '@mikro-orm/postgresql';

import { createOutboxEventSchema, OUTBOX_CONTEXTS, type OutboxContext } from './outbox-event.schema';

/**
 * Creates the context schemas and their `outbox_event` tables from `createOutboxEventSchema`, for specs that need the
 * outbox without the api migrations. The table shape comes from the same schema the relay and the write repository use,
 * so it cannot drift from them; the api checks it against its real migrations. Exposed as `@house-radar/outbox/testing`.
 */
export async function createOutboxTables(
  databaseUrl: string,
  contexts: readonly OutboxContext[] = OUTBOX_CONTEXTS,
): Promise<void> {
  const orm = await MikroORM.init(
    defineConfig({
      clientUrl: databaseUrl,
      entities: contexts.map((context) => createOutboxEventSchema(context)),
      discovery: { warnWhenNoEntities: false },
    }),
  );
  try {
    await orm.schema.create();
  } finally {
    await orm.close(true);
  }
}
