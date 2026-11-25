import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Redis } from 'ioredis';

import { AppConfig } from '@core/config/app-config/app-config.js';

const CHECK_TIMEOUT_MS = 3000;

/** Reports whether Redis accepts a connection and answers PING. */
@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly config: AppConfig,
    private readonly indicators: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.indicators.check(key);
    // One-shot client: no reconnect loop, so an unreachable Redis fails the check instead of hanging it.
    const client = new Redis(this.config.redisUrl, {
      lazyConnect: true,
      connectTimeout: CHECK_TIMEOUT_MS,
      commandTimeout: CHECK_TIMEOUT_MS,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });
    client.on('error', () => undefined);
    try {
      await client.connect();
      await client.ping();
      return indicator.up();
    } catch {
      return indicator.down({ message: 'Redis is unreachable' });
    } finally {
      client.disconnect();
    }
  }
}
