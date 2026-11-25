import { type DataOrigin, known, type Maybe, UNKNOWN } from '../known';
import type { MaybePrimitives } from '../maybe-primitives';

/** Origin of every known attribute of a record, keyed by attribute name. Unknown attributes have no entry. */
export type OriginsRecord = Record<string, DataOrigin>;

/** Splits a known/unknown primitive into its column value and records its origin under `key`. */
export function toColumn<T>(datum: MaybePrimitives<T>, key: string, origins: OriginsRecord): T | null {
  if (datum.kind === 'unknown') return null;
  origins[key] = datum.origin;
  return datum.value;
}

/** Rebuilds a `Maybe` from a nullable column and the origins record. A null column is unknown. */
export function fromColumn<TColumn, TValue>(
  value: TColumn | null | undefined,
  key: string,
  origins: OriginsRecord,
  build: (value: TColumn) => TValue,
): Maybe<TValue> {
  if (value === null || value === undefined) return UNKNOWN;
  return known(build(value), origins[key] ?? 'declared');
}
