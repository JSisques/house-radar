import { afterEach, describe, expect, it } from 'vitest';

import { assertDockerAvailable } from './docker.js';

describe('assertDockerAvailable', () => {
  const originalHost = process.env['DOCKER_HOST'];

  afterEach(() => {
    if (originalHost === undefined) delete process.env['DOCKER_HOST'];
    else process.env['DOCKER_HOST'] = originalHost;
  });

  it('should fail with an explicit message when Docker is unavailable', async () => {
    process.env['DOCKER_HOST'] = 'tcp://127.0.0.1:1';

    await expect(assertDockerAvailable()).rejects.toThrow(/Docker is not available/);
  });
});
