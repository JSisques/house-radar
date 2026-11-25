import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { type StartedRedis, startRedis } from '@house-radar/testing';

import { NOOP_JOB, NOOP_QUEUE, NoopProcessor } from '@core/queue/noop-job/noop.processor.js';
import { QueueRegistry } from '@core/queue/queue-registry/queue-registry.js';
import { upsertRepeatableJob } from '@core/queue/repeatable-job/repeatable-job.js';

import { AppModule } from './app.module.js';

const SETTLE_MS = 750;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(condition: () => boolean, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for the condition');
    await sleep(25);
  }
}

describe('queue plumbing', () => {
  const originalEnv = { ...process.env };
  let redis: StartedRedis;
  const apps: INestApplication[] = [];

  /** Boots one worker replica against the shared Redis. */
  async function boot(): Promise<INestApplication> {
    process.env.REDIS_URL = redis.url;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    apps.push(app);
    return app;
  }

  beforeAll(async () => {
    redis = await startRedis();
  });
  afterEach(async () => {
    process.env = { ...originalEnv };
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await redis.reset();
  });
  afterAll(async () => {
    await redis.stop();
  });

  it('should consume an enqueued no-op job exactly once', async () => {
    const app = await boot();
    const processor = app.get(NoopProcessor);

    await app.get(QueueRegistry).get(NOOP_QUEUE).add(NOOP_JOB, {}, { jobId: 'noop.single' });

    await waitFor(() => processor.handled.length > 0);
    await sleep(SETTLE_MS);
    expect(processor.handled).toEqual(['noop.single']);
  });

  it('should let only one of two worker replicas process a job', async () => {
    const [first, second] = [await boot(), await boot()];
    const handled = () => [...first.get(NoopProcessor).handled, ...second.get(NoopProcessor).handled];

    await first.get(QueueRegistry).get(NOOP_QUEUE).add(NOOP_JOB, {}, { jobId: 'noop.shared' });

    await waitFor(() => handled().length > 0);
    await sleep(SETTLE_MS);
    expect(handled()).toEqual(['noop.shared']);
  });

  it('should keep a single scheduler when the same repeatable job is upserted twice', async () => {
    const app = await boot();
    const queue = app.get(QueueRegistry).get(NOOP_QUEUE);

    await upsertRepeatableJob(queue, { schedulerId: 'noop.every-hour', everyMs: 3_600_000, jobName: NOOP_JOB });
    await upsertRepeatableJob(queue, { schedulerId: 'noop.every-hour', everyMs: 3_600_000, jobName: NOOP_JOB });

    const schedulers = await queue.getJobSchedulers();
    expect(schedulers.map((scheduler) => scheduler.key)).toEqual(['noop.every-hour']);
  });
});
