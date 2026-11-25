import { MikroORM } from '@mikro-orm/postgresql';

import { CONTEXT_SCHEMAS } from '@core/persistence/context-schema/context-schema.js';
import { createOrmOptions, type MigrationStream } from '@core/persistence/orm-config/orm-config.js';

const STREAMS: readonly MigrationStream[] = ['core', ...CONTEXT_SCHEMAS];

/** Applies every pending migration: core first (PostGIS and schemas), then one stream per context. */
export async function runMigrations(clientUrl: string): Promise<void> {
  for (const stream of STREAMS) {
    const orm = await MikroORM.init(createOrmOptions(stream, clientUrl));
    try {
      await orm.migrator.up();
    } finally {
      await orm.close(true);
    }
  }
}
