import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';

import { assertDockerAvailable } from './docker.js';

/** Same image as compose.yaml, so specs run against the engine used in development. */
export const POSTGIS_IMAGE = 'postgis/postgis:17-3.5';

export interface StartedPostgres {
  readonly connectionUri: string;
  /** Drops everything in the public schema and re-enables PostGIS. */
  reset(): Promise<void>;
  stop(): Promise<void>;
}

/** Drops and recreates the public schema, then enables PostGIS again. */
export async function resetSchema(connectionUri: string): Promise<void> {
  const client = new pg.Client({ connectionString: connectionUri });
  await client.connect();
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
  } finally {
    await client.end();
  }
}

/** Starts a throwaway PostGIS database. Each call gets its own container. */
export async function startPostgres(): Promise<StartedPostgres> {
  await assertDockerAvailable();
  const container = await new PostgreSqlContainer(POSTGIS_IMAGE).start();
  const connectionUri = container.getConnectionUri();
  await resetSchema(connectionUri);
  return {
    connectionUri,
    reset: () => resetSchema(connectionUri),
    stop: async () => {
      await container.stop();
    },
  };
}
