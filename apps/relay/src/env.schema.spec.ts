import { describe, expect, it } from 'vitest';

import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  it('applies the local defaults when nothing is set', () => {
    expect(validateEnv({})).toEqual({
      DATABASE_URL: 'postgres://house_radar:house_radar@localhost:55432/house_radar',
      REDIS_URL: 'redis://localhost:56379',
      OUTBOX_RELAY_INTERVAL_MS: 1000,
      RELAY_PORT: 3002,
    });
  });

  it('reads the polling interval and the health port', () => {
    const env = validateEnv({ OUTBOX_RELAY_INTERVAL_MS: '250', RELAY_PORT: '4020' });

    expect(env.OUTBOX_RELAY_INTERVAL_MS).toBe(250);
    expect(env.RELAY_PORT).toBe(4020);
  });

  it('fails naming the variable when the interval or the port is invalid', () => {
    expect(() => validateEnv({ OUTBOX_RELAY_INTERVAL_MS: '0' })).toThrow(/OUTBOX_RELAY_INTERVAL_MS/);
    expect(() => validateEnv({ RELAY_PORT: 'abc' })).toThrow(/RELAY_PORT/);
  });
});
