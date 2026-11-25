import type { z } from 'zod';

export function validateSearch<Schema extends z.ZodType>(schema: Schema) {
  return (input: Record<string, unknown>): z.output<Schema> => schema.parse(input);
}
