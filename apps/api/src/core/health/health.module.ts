import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from '@core/health/health-controller/health.controller.js';
import { PostgresHealthIndicator } from '@core/health/postgres-health-indicator/postgres.health-indicator.js';
import { RedisHealthIndicator } from '@core/health/redis-health-indicator/redis.health-indicator.js';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PostgresHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
