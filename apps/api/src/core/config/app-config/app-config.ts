import type { Env } from '@core/config/env/env.schema.js';

/** Validated, immutable application configuration. Provided by `CoreModule`. */
export class AppConfig {
  constructor(private readonly env: Env) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get redisUrl(): string {
    return this.env.REDIS_URL;
  }

  get logLevel(): Env['LOG_LEVEL'] {
    return this.env.LOG_LEVEL;
  }

  get otlpEndpoint(): string | undefined {
    return this.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  }
}
