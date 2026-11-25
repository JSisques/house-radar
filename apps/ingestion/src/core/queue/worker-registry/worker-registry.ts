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
  private readonly workers: Worker[] = [];

  constructor(private readonly config: AppConfig) {}

  /** Resolves once the worker is connected and ready to claim jobs. */
  async start(queueName: string, handler: JobHandler, options: Partial<WorkerOptions> = {}): Promise<Worker> {
    const worker = new Worker(queueName, handler, { ...options, connection: { url: this.config.redisUrl } });
    this.workers.push(worker);
    await worker.waitUntilReady();
    return worker;
  }

  async onApplicationShutdown(): Promise<void> {
    await Promise.all(this.workers.splice(0).map((worker) => worker.close()));
  }
}
