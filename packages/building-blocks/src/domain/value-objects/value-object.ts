type Scalar = string | number | boolean;

/**
 * What `toPrimitives()` may return: a scalar, or a flat record of scalars for composite value objects.
 * Declare composite primitives with a `type` alias; an `interface` has no index signature and is rejected.
 */
export type ValueObjectPrimitives = Scalar | { readonly [key: string]: Scalar };

const isRecord = (primitives: ValueObjectPrimitives): primitives is { readonly [key: string]: Scalar } =>
  typeof primitives === 'object';

const primitivesEqual = (a: ValueObjectPrimitives, b: ValueObjectPrimitives): boolean => {
  if (!isRecord(a) || !isRecord(b)) return Object.is(a, b);
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => key in b && Object.is(a[key], b[key]));
};

/**
 * Base for every value object. `validate()` is mandatory and runs on construction,
 * after `_value` and `options` are set, so it can read both.
 */
export abstract class ValueObject<TValue, TOptions = undefined> {
  protected readonly _value: TValue;
  protected readonly options: TOptions;

  constructor(value: TValue, options?: TOptions) {
    this._value = value;
    this.options = options as TOptions;
    this.validate();
  }

  protected abstract validate(): void;

  abstract toPrimitives(): ValueObjectPrimitives;

  /** Same class and equal primitives (field by field for composite ones). Null-safe. */
  equals(other: ValueObject<unknown, unknown> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return primitivesEqual(this.toPrimitives(), other.toPrimitives());
  }
}
