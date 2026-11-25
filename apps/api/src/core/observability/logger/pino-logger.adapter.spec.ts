import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';

import { PinoLogger } from './pino-logger.adapter.js';

function fakeTelemetry(traceId: string | undefined): ITelemetry {
  return { runInSpan: (_name, fn) => fn(), currentTraceId: () => traceId };
}

function capture(traceId: string | undefined): { logger: PinoLogger; lines: () => Record<string, unknown>[] } {
  const chunks: string[] = [];
  const destination = new Writable({
    write(chunk: Buffer, _enc, done) {
      chunks.push(chunk.toString());
      done();
    },
  });
  const logger = new PinoLogger({ level: 'debug', serviceName: 'test-svc', destination }, fakeTelemetry(traceId));
  return {
    logger,
    lines: () =>
      chunks
        .join('')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Record<string, unknown>),
  };
}

describe('PinoLogger', () => {
  it('writes a JSON line with message, level and the current trace id', () => {
    const { logger, lines } = capture('abc123');

    logger.info('hello', { userId: 7 });

    expect(lines()[0]).toMatchObject({ msg: 'hello', userId: 7, trace_id: 'abc123', service: 'test-svc' });
  });

  it('omits trace_id outside a span', () => {
    const { logger, lines } = capture(undefined);

    logger.info('hello');

    expect(lines()[0]).not.toHaveProperty('trace_id');
  });

  it.each(['password', 'token', 'authorization'])('redacts a %s field', (field) => {
    const { logger, lines } = capture('trace-1');

    logger.info('login', { [field]: 'secret-value', nested: { [field]: 'secret-value' } });

    const line = JSON.stringify(lines()[0]);
    expect(line).not.toContain('secret-value');
    expect(lines()[0]).toMatchObject({ [field]: '[REDACTED]' });
  });

  it('redacts the authorization request header', () => {
    const { logger, lines } = capture('trace-1');

    logger.info('req', { headers: { authorization: 'Bearer abc' } });

    expect(JSON.stringify(lines()[0])).not.toContain('Bearer abc');
  });

  it('honors the configured level', () => {
    const chunks: string[] = [];
    const destination = new Writable({ write: (c: Buffer, _e, d) => (chunks.push(c.toString()), d()) });
    const logger = new PinoLogger({ level: 'warn', serviceName: 's', destination }, fakeTelemetry(undefined));

    logger.info('dropped');
    logger.warn('kept');

    expect(chunks.join('')).toContain('kept');
    expect(chunks.join('')).not.toContain('dropped');
  });
});
