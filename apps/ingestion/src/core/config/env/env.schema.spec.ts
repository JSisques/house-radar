import { describe, expect, it } from 'vitest';

import { validateEnv } from '@core/config/env/env.schema.js';

describe('validateEnv', () => {
  it('should apply the local defaults when nothing is set', () => {
    expect(validateEnv({})).toEqual({
      NODE_ENV: 'development',
      INGESTION_PORT: 3001,
      REDIS_URL: 'redis://localhost:56379',
    });
  });

  it('should coerce the port and keep explicit values', () => {
    expect(validateEnv({ NODE_ENV: 'production', INGESTION_PORT: '4100', REDIS_URL: 'redis://redis:6379' })).toEqual({
      NODE_ENV: 'production',
      INGESTION_PORT: 4100,
      REDIS_URL: 'redis://redis:6379',
    });
  });

  it('should fail fast naming every offending variable', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging', INGESTION_PORT: '0', REDIS_URL: '' })).toThrow(
      /NODE_ENV.*INGESTION_PORT.*REDIS_URL/,
    );
  });
});
