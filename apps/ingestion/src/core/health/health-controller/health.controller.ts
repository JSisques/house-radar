import { Controller, Get, Res, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import type { Response } from 'express';

import { RedisHealthIndicator } from '@core/health/redis-health-indicator/redis.health-indicator.js';

/** Liveness/dependency probe for the orchestrator: no authentication. */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(@Res({ passthrough: true }) res: Response) {
    try {
      return await this.health.check([() => this.redis.isHealthy('redis')]);
    } catch (error) {
      // Terminus signals "unhealthy" with a 503 exception; answer with its report and keep the 503.
      if (error instanceof ServiceUnavailableException) {
        res.status(error.getStatus());
        return error.getResponse();
      }
      throw error;
    }
  }
}
