import type { Queue } from 'bullmq';

export interface RepeatableJob {
  /** Stable ID: upserting the same ID again updates the schedule instead of adding a second one. */
  schedulerId: string;
  /** Fixed interval. Exactly one of `everyMs` or `pattern` must be given. */
  everyMs?: number;
  /** Cron expression. */
  pattern?: string;
  jobName: string;
  data?: Record<string, unknown>;
}

/** Registers (or updates) a repeatable job on a queue. The scheduler only enqueues; workers execute (D7, D23). */
export async function upsertRepeatableJob(queue: Queue, job: RepeatableJob): Promise<void> {
  if ((job.everyMs === undefined) === (job.pattern === undefined)) {
    throw new Error(`Repeatable job "${job.schedulerId}" needs exactly one of everyMs or pattern`);
  }
  const repeat = job.everyMs === undefined ? { pattern: job.pattern } : { every: job.everyMs };
  await queue.upsertJobScheduler(job.schedulerId, repeat, { name: job.jobName, data: job.data ?? {} });
}
