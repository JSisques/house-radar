import { Writable } from 'node:stream';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { LOGGER_TOKEN } from '@core/observability/logger/logger.port.js';
import { PinoLogger } from '@core/observability/logger/pino-logger.adapter.js';
import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';
import { TELEMETRY_TOKEN } from '@core/observability/telemetry/telemetry.port.js';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

const UNREACHABLE_POSTGRES = 'postgres://nobody:nobody@127.0.0.1:1/nothing';
const UNREACHABLE_REDIS = 'redis://127.0.0.1:1';

describe('API observability', () => {
  const originalEnv = { ...process.env };
  let app: INestApplication | undefined;

  afterEach(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    app = undefined;
  });

  async function boot(
    telemetry?: ITelemetry,
  ): Promise<{ app: INestApplication; lines: () => Record<string, unknown>[] }> {
    process.env.DATABASE_URL = UNREACHABLE_POSTGRES;
    process.env.REDIS_URL = UNREACHABLE_REDIS;
    const chunks: string[] = [];
    const destination = new Writable({ write: (chunk: Buffer, _enc, done) => (chunks.push(chunk.toString()), done()) });
    let builder = Test.createTestingModule({ imports: [AppModule] });
    builder = builder.overrideProvider(LOGGER_TOKEN).useFactory({
      factory: (t: ITelemetry) => new PinoLogger({ level: 'info', serviceName: 'api-test', destination }, t),
      inject: [TELEMETRY_TOKEN],
    });
    if (telemetry) {
      builder = builder.overrideProvider(TELEMETRY_TOKEN).useValue(telemetry);
    }
    app = (await builder.compile()).createNestApplication();
    configureApp(app);
    await app.init();
    const lines = () =>
      chunks
        .join('')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Record<string, unknown>);
    return { app, lines };
  }

  it('writes a structured log line with a trace identifier for an API request', async () => {
    const { app: booted, lines } = await boot();

    await request(booted.getHttpServer()).get('/api/health');

    const line = lines().find((l) => l.msg === 'request completed' || l.msg === 'request failed');
    expect(line).toMatchObject({ method: 'GET', url: '/api/health' });
    expect(line?.trace_id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('runs unchanged application code when the OTel adapter is replaced', async () => {
    const spans: string[] = [];
    const fake: ITelemetry = {
      runInSpan: (name, fn) => (spans.push(name), fn()),
      currentTraceId: () => 'fake-trace-id',
      emitLog: () => undefined,
    };
    const { app: booted, lines } = await boot(fake);

    await request(booted.getHttpServer()).get('/api/health');

    expect(spans).toEqual(['GET /api/health']);
    expect(lines().find((l) => l.url === '/api/health')).toMatchObject({ trace_id: 'fake-trace-id' });
  });
});
