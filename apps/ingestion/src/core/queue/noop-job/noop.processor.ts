import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { Job } from 'bullmq';

import { WorkerRegistry } from '@core/queue/worker-registry/worker-registry.js';

export const NOOP_QUEUE = 'ingestion.noop';
export const NOOP_JOB = 'noop';

/** Proves the queue plumbing end to end before any connector exists: consumes `noop` jobs and records their IDs. */
@Injectable()
export class NoopProcessor implements OnApplicationBootstrap {
  readonly handled: string[] = [];

  constructor(private readonly workers: WorkerRegistry) {}

  onApplicationBootstrap(): void {
    this.workers.start(NOOP_QUEUE, (job) => this.process(job));
  }

  private process(job: Job): Promise<void> {
    this.handled.push(job.id ?? '');
    return Promise.resolve();
  }
}
