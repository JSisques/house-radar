import { Module } from '@nestjs/common';

import { CoreModule } from '@core/core.module.js';
import { HealthModule } from '@core/health/health.module.js';
import { NoopProcessor } from '@core/queue/noop-job/noop.processor.js';
import { QueueModule } from '@core/queue/queue.module.js';

// Bounded contexts and connectors (`src/contexts/*`) are imported here as they arrive.
@Module({ imports: [CoreModule, QueueModule, HealthModule], providers: [NoopProcessor] })
export class AppModule {}
