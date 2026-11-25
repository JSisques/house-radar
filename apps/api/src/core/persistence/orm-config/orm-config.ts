import { join } from 'node:path';

import { type Options, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, type PostgreSqlDriver } from '@mikro-orm/postgresql';

import { CONTEXT_SCHEMAS, type ContextSchema } from '@core/persistence/context-schema/context-schema.js';

/** Root of the compiled or source tree, whichever is running: this file is core/persistence/orm-config/. */
const SRC_ROOT = join(import.meta.dirname, '..', '..', '..');

export type MigrationStream = 'core' | ContextSchema;

/** Naming rules: snake_case tables and columns, <table>_pkey-style constraint names left to PostgreSQL defaults. */
export class SnakeCaseNamingStrategy extends UnderscoreNamingStrategy {}

function streamPaths(stream: MigrationStream): { path: string; schema?: string } {
  if (stream === 'core') return { path: join(SRC_ROOT, 'core', 'persistence', 'migrations', 'core') };
  return {
    path: join(SRC_ROOT, 'contexts', stream, 'infrastructure', 'persistence', 'mikro-orm', 'migrations'),
    schema: stream,
  };
}

/**
 * ORM options for one migration stream. The core stream tracks itself in public and creates the context
 * schemas; each context stream tracks itself inside its own schema and only discovers its own entity schemas,
 * so a generated migration can only touch that schema.
 */
export function createOrmOptions(
  stream: MigrationStream,
  clientUrl: string,
  overrides: Partial<Options<PostgreSqlDriver>> = {},
) {
  const { path, schema } = streamPaths(stream);
  return defineConfig({
    clientUrl,
    ...(schema ? { schema } : {}),
    entities:
      stream === 'core'
        ? []
        : [
            join(
              SRC_ROOT,
              'contexts',
              stream,
              'infrastructure',
              'persistence',
              'mikro-orm',
              'schemas',
              '*.schema.{js,ts}',
            ),
          ],
    namingStrategy: SnakeCaseNamingStrategy,
    extensions: [Migrator],
    discovery: { warnWhenNoEntities: false },
    // The diff is database-wide: ignore every schema but this stream's own, or generated migrations drop the rest.
    schemaGenerator: {
      ignoreSchema: [...CONTEXT_SCHEMAS, 'public'].filter((name) => name !== schema),
    },
    migrations: { path, ...(schema ? { schema } : {}), emit: 'ts', snapshot: false },
    ...overrides,
  });
}
