import 'reflect-metadata';

import { validateEnv } from '@core/config/env/env.schema.js';
import { startOutboxRelayProcess } from '@core/persistence/outbox/outbox-relay-process.js';

/** Production entrypoint of the outbox relay: `node dist/relay.js`. Runs apart from the HTTP api (D33). */
async function main(): Promise<void> {
  const env = validateEnv(process.env);
  const relay = await startOutboxRelayProcess({
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    intervalMs: env.OUTBOX_RELAY_INTERVAL_MS,
    port: env.RELAY_PORT,
  });

  let stopping = false;
  const shutdown = (): void => {
    if (stopping) return;
    stopping = true;
    relay.stop().then(
      () => process.exit(0),
      () => process.exit(1),
    );
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
