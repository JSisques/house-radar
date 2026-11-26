import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { IngestionModule } from '@contexts/ingestion/ingestion.module';
import { PropertiesModule } from '@contexts/properties/properties.module';
import { CoreModule } from '@core/core.module.js';
import { HealthModule } from '@core/health/health.module.js';
import { ObservabilityModule } from '@core/observability/observability.module.js';

// Bounded contexts (`src/contexts/*`) are imported here as they arrive.
@Module({
  imports: [CqrsModule.forRoot(), CoreModule, ObservabilityModule, HealthModule, IngestionModule, PropertiesModule],
})
export class AppModule {}
