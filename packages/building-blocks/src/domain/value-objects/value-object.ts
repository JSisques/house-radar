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

  abstract toPrimitives(): string | number | boolean;

  /** Same class and equal primitives. Null-safe. */
  equals(other: ValueObject<unknown, unknown> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return Object.is(this.toPrimitives(), other.toPrimitives());
  }
}
