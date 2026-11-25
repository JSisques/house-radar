import { InvalidEnumException } from './invalid-enum.exception';
import { ValueObject } from './value-object';

export interface EnumValueObjectOptions<T extends string | number> {
  values: readonly T[];
}

export class EnumValueObject<T extends string | number = string> extends ValueObject<T, EnumValueObjectOptions<T>> {
  constructor(value: T, options: EnumValueObjectOptions<T>) {
    super(value, options);
  }

  get value(): T {
    return this._value;
  }

  protected validate(): void {
    const values = this.options?.values;
    if (!Array.isArray(values) || values.length === 0) {
      throw new InvalidEnumException('values must be a non-empty array');
    }
    if (new Set(values).size !== values.length) throw new InvalidEnumException('values must be unique');
    if (!values.includes(this._value)) {
      throw new InvalidEnumException(`value must be one of: ${values.join(', ')}`);
    }
  }

  toPrimitives(): T {
    return this._value;
  }
}
