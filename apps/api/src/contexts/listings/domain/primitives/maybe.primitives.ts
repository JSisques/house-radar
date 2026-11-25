import { type DataOrigin, isKnown, type Maybe } from '@house-radar/shared-kernel';

export type MaybePrimitives<T> = { kind: 'unknown' } | { kind: 'known'; value: T; origin: DataOrigin };

/** Serializes a `Known<T> | Unknown` datum, keeping its origin. */
export const maybeToPrimitives = <TValue, TPrimitive>(
  datum: Maybe<TValue>,
  toPrimitive: (value: TValue) => TPrimitive,
): MaybePrimitives<TPrimitive> =>
  isKnown(datum) ? { kind: 'known', value: toPrimitive(datum.value), origin: datum.origin } : { kind: 'unknown' };
