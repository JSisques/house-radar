import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';

import type { ILogger, LogFields } from '@core/observability/logger/logger.port.js';
import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';

import { RequestLoggingInterceptor } from './request-logging.interceptor.js';

interface Entry {
  level: 'info' | 'warn' | 'error';
  message: string;
  fields?: LogFields;
}

function fakes(): { logger: ILogger; telemetry: ITelemetry; entries: Entry[]; spans: string[] } {
  const entries: Entry[] = [];
  const spans: string[] = [];
  const push = (level: Entry['level']) => (message: string, fields?: LogFields) =>
    entries.push({ level, message, fields });
  const logger: ILogger = { debug: () => undefined, info: push('info'), warn: push('warn'), error: push('error') };
  const telemetry: ITelemetry = {
    runInSpan: (name, fn) => (spans.push(name), fn()),
    currentTraceId: () => 'trace-1',
  };
  return { logger, telemetry, entries, spans };
}

function context(statusCode = 200): ExecutionContext {
  const request = { method: 'GET', originalUrl: '/api/health' };
  const response = { statusCode };
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext;
}

describe('RequestLoggingInterceptor', () => {
  it('logs one line per request inside a span, with method, url, status and duration', async () => {
    const { logger, telemetry, entries, spans } = fakes();
    const handler: CallHandler = { handle: () => of('ok') };

    await lastValueFrom(new RequestLoggingInterceptor(logger, telemetry).intercept(context(200), handler));

    expect(spans).toEqual(['GET /api/health']);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      level: 'info',
      message: 'request completed',
      fields: { method: 'GET', url: '/api/health', statusCode: 200 },
    });
    expect(entries[0]?.fields?.durationMs).toEqual(expect.any(Number));
  });

  it('logs failures with the error status and rethrows', async () => {
    const { logger, telemetry, entries } = fakes();
    const failure = new HttpException('nope', 404);
    const handler: CallHandler = { handle: () => throwError(() => failure) };

    await expect(
      lastValueFrom(new RequestLoggingInterceptor(logger, telemetry).intercept(context(), handler)),
    ).rejects.toBe(failure);

    expect(entries[0]).toMatchObject({ level: 'warn', message: 'request failed', fields: { statusCode: 404 } });
  });

  it('logs unexpected errors as errors with status 500', async () => {
    const { logger, telemetry, entries } = fakes();
    const handler: CallHandler = { handle: () => throwError(() => new Error('boom')) };

    await expect(
      lastValueFrom(new RequestLoggingInterceptor(logger, telemetry).intercept(context(), handler)),
    ).rejects.toThrow('boom');

    expect(entries[0]).toMatchObject({ level: 'error', fields: { statusCode: 500 } });
  });
});
