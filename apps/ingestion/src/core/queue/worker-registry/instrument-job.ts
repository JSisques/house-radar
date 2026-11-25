import type { Job } from 'bullmq';

import type { ILogger } from '@core/observability/logger/logger.port.js';
import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';

export type JobHandler = (job: Job) => Promise<unknown>;

/**
 * Wraps a job handler in a span and logs its start, completion and failure. Logging happens inside the span so every
 * line carries the trace id. The original error is rethrown untouched, so BullMQ retries behave as before.
 */
export function instrumentJob(handler: JobHandler, logger: ILogger, telemetry: ITelemetry): JobHandler {
  return (job) =>
    telemetry.runInSpan(`${job.queueName} ${job.name}`, async () => {
      const fields = { queue: job.queueName, jobName: job.name, jobId: job.id, attempt: job.attemptsMade + 1 };
      const startedAt = Date.now();
      logger.info('job started', fields);
      try {
        const result = await handler(job);
        logger.info('job completed', { ...fields, durationMs: Date.now() - startedAt });
        return result;
      } catch (error) {
        logger.error('job failed', {
          ...fields,
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
}
