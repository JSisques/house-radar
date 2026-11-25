import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  // Defaults match the local docker-compose ports (.env.example).
  DATABASE_URL: z.string().min(1).default('postgres://house_radar:house_radar@localhost:55432/house_radar'),
  REDIS_URL: z.string().min(1).default('redis://localhost:56379'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Unset = traces/metrics are not exported (local dev without a collector).
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Validates the raw environment and fails fast, naming every offending variable. */
export function validateEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${problems.join('; ')}`);
  }
  return result.data;
}
