import { type DataOrigin, known, type Maybe, type MaybePrimitives, UNKNOWN } from '@house-radar/shared-kernel';

/** Splits a known/unknown primitive into its column value and records its origin under `key`. */
export function toColumn<T>(datum: MaybePrimitives<T>, key: string, origins: Record<string, DataOrigin>): T | null {
  if (datum.kind === 'unknown') return null;
  origins[key] = datum.origin;
  return datum.value;
}

/** Rebuilds a `Maybe` from a nullable column and the origins record. A null column is unknown. */
export function fromColumn<TColumn, TValue>(
  value: TColumn | null,
  key: string,
  origins: Record<string, DataOrigin>,
  build: (value: TColumn) => TValue,
): Maybe<TValue> {
  if (value === null || value === undefined) return UNKNOWN;
  return known(build(value), origins[key] ?? 'declared');
}
