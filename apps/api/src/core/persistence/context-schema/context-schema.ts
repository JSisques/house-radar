/** One PostgreSQL schema per bounded context (D30). Order is the order migrations run in. */
export const CONTEXT_SCHEMAS = ['ingestion', 'listings', 'properties', 'geography', 'identity', 'users'] as const;

export type ContextSchema = (typeof CONTEXT_SCHEMAS)[number];
