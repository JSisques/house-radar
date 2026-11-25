import { getContainerRuntimeClient } from 'testcontainers';

/** Fails fast, with an actionable message, when no Docker daemon is reachable. */
export async function assertDockerAvailable(): Promise<void> {
  try {
    await getContainerRuntimeClient();
  } catch (cause) {
    throw new Error(
      'Docker is not available: integration specs need a running Docker daemon. ' +
        'Start Docker (or set DOCKER_HOST) and run the suite again.',
      { cause },
    );
  }
}
