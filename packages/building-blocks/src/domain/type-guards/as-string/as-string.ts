/** The value when it is a string, otherwise null. */
export const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);
