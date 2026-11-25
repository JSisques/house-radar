import { z } from 'zod';

export const envSchema = z.object({
  // Defaults match the local docker-compose ports (.env.example).
  DATABASE_URL: z.string().min(1).default('postgres://house_radar:house_radar@localhost:55432/house_radar'),
  REDIS_URL: z.string().min(1).default('redis://localhost:56379'),
  /** How often each context's outbox is polled. */
  OUTBOX_RELAY_INTERVAL_MS: z.coerce.number().int().min(1).default(1000),
  /** Port of the healthcheck endpoint (`GET /health`). */
  RELAY_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
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
