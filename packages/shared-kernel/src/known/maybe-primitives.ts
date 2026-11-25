import { type DataOrigin, isKnown, type Maybe } from './known';

/**
 * Plain, serializable form of a datum that may be unknown (`Known<T> | Unknown`).
 * A known datum keeps its value and its origin (declared, calculated or inferred);
 * an unknown one is only `{ kind: 'unknown' }`, never 0, an empty string or null.
 * It is what `toPrimitives()` returns for every optional field, so events and persistence
 * can tell "nobody stated it" apart from "it is zero".
 */
export type MaybePrimitives<T> = { kind: 'unknown' } | { kind: 'known'; value: T; origin: DataOrigin };

/**
 * Converts a `Known<T> | Unknown` datum to its `MaybePrimitives` form, mapping the value
 * (for example a value object to its number) and leaving unknown data unknown.
 */
export const maybeToPrimitives = <TValue, TPrimitive>(
  datum: Maybe<TValue>,
  toPrimitive: (value: TValue) => TPrimitive,
): MaybePrimitives<TPrimitive> =>
  isKnown(datum) ? { kind: 'known', value: toPrimitive(datum.value), origin: datum.origin } : { kind: 'unknown' };
