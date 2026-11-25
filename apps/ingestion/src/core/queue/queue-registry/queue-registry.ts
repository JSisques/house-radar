import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { Queue } from 'bullmq';

import { AppConfig } from '@core/config/app-config/app-config.js';

/**
 * One BullMQ queue per name, created on first use and shared by the whole process (D7, D23: a queue per source, so
 * adding a source means asking for one more name). Queues are closed on shutdown.
 */
@Injectable()
export class QueueRegistry implements OnApplicationShutdown {
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly config: AppConfig) {}

  get(name: string): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, { connection: { url: this.config.redisUrl } });
      this.queues.set(name, queue);
    }
    return queue;
  }

  async onApplicationShutdown(): Promise<void> {
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    this.queues.clear();
  }
}
