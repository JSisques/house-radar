import { RedisContainer } from '@testcontainers/redis';

import { assertDockerAvailable } from './docker.js';

export const REDIS_IMAGE = 'redis:7-alpine';

export interface StartedRedis {
  readonly url: string;
  /** Removes every key from every database. */
  reset(): Promise<void>;
  stop(): Promise<void>;
}

/** Starts a throwaway Redis. Each call gets its own container. */
export async function startRedis(): Promise<StartedRedis> {
  await assertDockerAvailable();
  const container = await new RedisContainer(REDIS_IMAGE).start();
  return {
    url: container.getConnectionUrl(),
    reset: async () => {
      await container.executeCliCmd('flushall');
    },
    stop: async () => {
      await container.stop();
    },
  };
}
