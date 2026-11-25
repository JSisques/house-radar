import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { Worker, type WorkerOptions } from 'bullmq';

import { AppConfig } from '@core/config/app-config/app-config.js';
import { type ILogger, LOGGER_TOKEN } from '@core/observability/logger/logger.port.js';
import { type ITelemetry, TELEMETRY_TOKEN } from '@core/observability/telemetry/telemetry.port.js';
import { instrumentJob, type JobHandler } from '@core/queue/worker-registry/instrument-job.js';

export type { JobHandler } from '@core/queue/worker-registry/instrument-job.js';

/**
 * Starts BullMQ workers against the configured Redis. Replicas are identical and stateless: BullMQ hands each job to
 * one worker at a time, so running more replicas only adds throughput (D23). Workers are closed on shutdown, letting
 * the active job finish. Every handler is wrapped in a span with structured start/completion/failure logs, so
 * processors stay free of observability code.
 */
@Injectable()
export class WorkerRegistry implements OnApplicationShutdown {
  private readonly workers = new Map<Worker, { connected: boolean }>();

  constructor(
    private readonly config: AppConfig,
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(TELEMETRY_TOKEN) private readonly telemetry: ITelemetry,
  ) {}

  /**
   * Starts the worker without waiting for Redis: BullMQ keeps reconnecting, so the process boots even when Redis is
   * down and `/health` reports it instead of the boot hanging.
   */
  start(queueName: string, handler: JobHandler, options: Partial<WorkerOptions> = {}): Worker {
    const worker = new Worker(queueName, instrumentJob(handler, this.logger, this.telemetry), {
      ...options,
      connection: { url: this.config.redisUrl },
    });
    const state = { connected: false };
    worker.on('ready', () => {
      state.connected = true;
    });
    worker.on('error', () => undefined);
    this.workers.set(worker, state);
    return worker;
  }

  async onApplicationShutdown(): Promise<void> {
    const entries = [...this.workers];
    this.workers.clear();
    // A graceful close waits for Redis and never settles when it is unreachable (and BullMQ caches that pending
    // promise, so it cannot be retried with force): only connected workers get the graceful close.
    await Promise.all(entries.map(([worker, state]) => worker.close(!state.connected)));
  }
}
