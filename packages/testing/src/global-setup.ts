import { assertDockerAvailable } from './docker.js';

/** Vitest `globalSetup`: aborts the whole run up front when Docker is missing. */
export async function setup(): Promise<void> {
  await assertDockerAvailable();
}
