import { Controller, Get, Res, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import type { Response } from 'express';

import { PostgresHealthIndicator } from '@core/health/postgres-health-indicator/postgres.health-indicator.js';
import { RedisHealthIndicator } from '@core/health/redis-health-indicator/redis.health-indicator.js';

/** Public liveness/dependency probe: no authentication. */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly postgres: PostgresHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Reports the state of PostgreSQL and Redis' })
  @ApiServiceUnavailableResponse({ description: 'At least one dependency is unreachable' })
  async check(@Res({ passthrough: true }) res: Response) {
    try {
      return await this.health.check([() => this.postgres.isHealthy('postgres'), () => this.redis.isHealthy('redis')]);
    } catch (error) {
      // Terminus signals "unhealthy" with a 503 exception; the global filter would flatten its report, so
      // answer with the report itself and keep the 503.
      if (error instanceof ServiceUnavailableException) {
        res.status(error.getStatus());
        return error.getResponse();
      }
      throw error;
    }
  }
}
