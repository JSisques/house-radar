/** How a datum came to be: stated by a person or source, derived deterministically, or guessed. */
export type DataOrigin = 'declared' | 'calculated' | 'inferred';

export interface Known<T> {
  readonly kind: 'known';
  readonly value: T;
  readonly origin: DataOrigin;
}

/** A datum nobody stated. It is never represented as 0, an empty string or null. */
export interface Unknown {
  readonly kind: 'unknown';
}

export type Maybe<T> = Known<T> | Unknown;

export const UNKNOWN: Unknown = Object.freeze({ kind: 'unknown' as const });

export const known = <T>(value: T, origin: DataOrigin): Known<T> => ({ kind: 'known', value, origin });

/** A datum a person stated: known and `declared` when present, unknown when absent. */
export const declaredOrUnknown = <TIn, TOut>(value: TIn | undefined, build: (value: TIn) => TOut): Maybe<TOut> =>
  value === undefined ? UNKNOWN : known(build(value), 'declared');

export const isKnown = <T>(datum: Maybe<T>): datum is Known<T> => datum.kind === 'known';

export const isUnknown = <T>(datum: Maybe<T>): datum is Unknown => datum.kind === 'unknown';
