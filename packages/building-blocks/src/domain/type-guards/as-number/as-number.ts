/** The value when it is a number, otherwise null. */
export const asNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null);
