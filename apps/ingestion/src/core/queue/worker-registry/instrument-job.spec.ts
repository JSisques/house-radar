import type { Job } from 'bullmq';
import { describe, expect, it } from 'vitest';

import type { ILogger, LogFields } from '@core/observability/logger/logger.port.js';
import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';
import { instrumentJob } from '@core/queue/worker-registry/instrument-job.js';

interface LogCall {
  level: 'info' | 'error';
  message: string;
  fields: LogFields;
}

function setup() {
  const logs: LogCall[] = [];
  const spans: string[] = [];
  let inSpan = false;
  const logger: ILogger = {
    debug: () => undefined,
    warn: () => undefined,
    info: (message, fields = {}) => void logs.push({ level: 'info', message, fields }),
    error: (message, fields = {}) => void logs.push({ level: 'error', message, fields }),
  };
  const telemetry: ITelemetry = {
    runInSpan: async (name, fn) => {
      spans.push(name);
      inSpan = true;
      try {
        return await fn();
      } finally {
        inSpan = false;
      }
    },
    currentTraceId: () => (inSpan ? 'trace-1' : undefined),
    emitLog: () => undefined,
  };
  const job = { id: '42', name: 'noop', queueName: 'ingestion.noop', attemptsMade: 2 } as unknown as Job;
  return { logs, spans, logger, telemetry, job };
}

describe('instrumentJob', () => {
  it('runs the handler in a span and logs completion with job name, id, attempt and duration', async () => {
    const { logs, spans, logger, telemetry, job } = setup();

    const result = await instrumentJob(() => Promise.resolve('done'), logger, telemetry)(job);

    expect(result).toBe('done');
    expect(spans).toEqual(['ingestion.noop noop']);
    expect(logs.map((l) => l.message)).toEqual(['job started', 'job completed']);
    expect(logs[1]?.fields).toMatchObject({ jobName: 'noop', jobId: '42', attempt: 3 });
    expect(logs[1]?.fields.durationMs).toEqual(expect.any(Number));
  });

  it('logs the failure as an error and rethrows the original error so BullMQ retries', async () => {
    const { logs, logger, telemetry, job } = setup();
    const boom = new Error('boom');

    await expect(instrumentJob(() => Promise.reject(boom), logger, telemetry)(job)).rejects.toBe(boom);

    const failed = logs.find((l) => l.message === 'job failed');
    expect(failed?.level).toBe('error');
    expect(failed?.fields).toMatchObject({ jobName: 'noop', jobId: '42', attempt: 3, error: 'boom' });
    expect(failed?.fields.durationMs).toEqual(expect.any(Number));
  });

  it('logs inside the span so the logger can attach the trace id', async () => {
    const { telemetry, job } = setup();
    const traceIds: (string | undefined)[] = [];
    const logger: ILogger = {
      debug: () => undefined,
      warn: () => undefined,
      info: () => void traceIds.push(telemetry.currentTraceId()),
      error: () => void traceIds.push(telemetry.currentTraceId()),
    };

    await instrumentJob(() => Promise.resolve(), logger, telemetry)(job);
    await instrumentJob(() => Promise.reject(new Error('x')), logger, telemetry)(job).catch(() => undefined);

    expect(traceIds).toEqual(['trace-1', 'trace-1', 'trace-1', 'trace-1']);
  });
});
