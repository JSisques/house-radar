import { describe, expect, it } from 'vitest';

import { validateEnv } from './env.schema.js';

describe('validateEnv', () => {
  it('applies defaults when optional variables are missing', () => {
    expect(validateEnv({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'postgres://house_radar:house_radar@localhost:55432/house_radar',
      REDIS_URL: 'redis://localhost:56379',
      LOG_LEVEL: 'info',
      OUTBOX_RELAY_INTERVAL_MS: 1000,
      RELAY_PORT: 3002,
    });
  });

  it('reads the outbox relay polling interval and health port', () => {
    const env = validateEnv({ OUTBOX_RELAY_INTERVAL_MS: '250', RELAY_PORT: '4020' });

    expect(env.OUTBOX_RELAY_INTERVAL_MS).toBe(250);
    expect(env.RELAY_PORT).toBe(4020);
  });

  it('fails naming the variable when the relay interval or port is invalid', () => {
    expect(() => validateEnv({ OUTBOX_RELAY_INTERVAL_MS: '0' })).toThrow(/OUTBOX_RELAY_INTERVAL_MS/);
    expect(() => validateEnv({ RELAY_PORT: 'abc' })).toThrow(/RELAY_PORT/);
  });

  it('reads the OTLP endpoint and log level from the environment', () => {
    const env = validateEnv({ OTEL_EXPORTER_OTLP_ENDPOINT: 'http://otel:4318', LOG_LEVEL: 'debug' });

    expect(env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe('http://otel:4318');
    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('fails naming the variable when the OTLP endpoint is not a URL or LOG_LEVEL is unknown', () => {
    expect(() => validateEnv({ OTEL_EXPORTER_OTLP_ENDPOINT: 'nope' })).toThrow(/OTEL_EXPORTER_OTLP_ENDPOINT/);
    expect(() => validateEnv({ LOG_LEVEL: 'loud' })).toThrow(/LOG_LEVEL/);
  });

  it('accepts connection URLs from the environment', () => {
    const env = validateEnv({ DATABASE_URL: 'postgres://u:p@db:5432/x', REDIS_URL: 'redis://cache:6379' });

    expect(env.DATABASE_URL).toBe('postgres://u:p@db:5432/x');
    expect(env.REDIS_URL).toBe('redis://cache:6379');
  });

  it('fails naming the variable when a connection URL is empty', () => {
    expect(() => validateEnv({ DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ REDIS_URL: '' })).toThrow(/REDIS_URL/);
  });

  it('coerces PORT to a number', () => {
    expect(validateEnv({ PORT: '4010' }).PORT).toBe(4010);
  });

  it('fails naming the variable when PORT is not a valid port', () => {
    expect(() => validateEnv({ PORT: 'abc' })).toThrow(/PORT/);
  });

  it('fails naming the variable when NODE_ENV is not allowed', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
