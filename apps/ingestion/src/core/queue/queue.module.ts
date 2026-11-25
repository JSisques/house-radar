import { Global, Module } from '@nestjs/common';

import { QueueRegistry } from '@core/queue/queue-registry/queue-registry.js';
import { WorkerRegistry } from '@core/queue/worker-registry/worker-registry.js';

@Global()
@Module({ providers: [QueueRegistry, WorkerRegistry], exports: [QueueRegistry, WorkerRegistry] })
export class QueueModule {}
