import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import pg from 'pg';

import { AppConfig } from '@core/config/app-config/app-config.js';

const CHECK_TIMEOUT_MS = 3000;

/** Reports whether PostgreSQL accepts a connection and answers a trivial query. */
@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly config: AppConfig,
    private readonly indicators: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.indicators.check(key);
    const client = new pg.Client({
      connectionString: this.config.databaseUrl,
      connectionTimeoutMillis: CHECK_TIMEOUT_MS,
      query_timeout: CHECK_TIMEOUT_MS,
    });
    // A dropped connection emits `error`; without a listener it would crash the process.
    client.on('error', () => undefined);
    try {
      await client.connect();
      await client.query('SELECT 1');
      return indicator.up();
    } catch {
      return indicator.down({ message: 'PostgreSQL is unreachable' });
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
