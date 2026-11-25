import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { type Job, Worker, type WorkerOptions } from 'bullmq';

import { AppConfig } from '@core/config/app-config/app-config.js';

export type JobHandler = (job: Job) => Promise<unknown>;

/**
 * Starts BullMQ workers against the configured Redis. Replicas are identical and stateless: BullMQ hands each job to
 * one worker at a time, so running more replicas only adds throughput (D23). Workers are closed on shutdown, letting
 * the active job finish.
 */
@Injectable()
export class WorkerRegistry implements OnApplicationShutdown {
  private readonly workers = new Map<Worker, { connected: boolean }>();

  constructor(private readonly config: AppConfig) {}

  /**
   * Starts the worker without waiting for Redis: BullMQ keeps reconnecting, so the process boots even when Redis is
   * down and `/health` reports it instead of the boot hanging.
   */
  start(queueName: string, handler: JobHandler, options: Partial<WorkerOptions> = {}): Worker {
    const worker = new Worker(queueName, handler, { ...options, connection: { url: this.config.redisUrl } });
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
