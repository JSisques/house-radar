/** True when the value is absent or only whitespace. */
export const isBlank = (value: string | null | undefined): boolean =>
  value === undefined || value === null || value.trim() === '';
