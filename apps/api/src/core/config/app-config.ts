import type { Env } from './env.schema.js';

/** Validated, immutable application configuration. Provided by `CoreModule`. */
export class AppConfig {
  constructor(private readonly env: Env) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }

  get port(): number {
    return this.env.PORT;
  }
}
