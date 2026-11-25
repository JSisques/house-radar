import { InvalidStringException } from './invalid-string.exception';
import { ValueObject } from './value-object';

export interface StringValueObjectOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

const isLength = (n: number | undefined): boolean => n === undefined || (Number.isInteger(n) && n >= 0);

export class StringValueObject extends ValueObject<string, StringValueObjectOptions> {
  constructor(value: string, options: StringValueObjectOptions = {}) {
    super(value, options);
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    const { minLength, maxLength, pattern } = this.options;
    if (!isLength(minLength) || !isLength(maxLength)) {
      throw new InvalidStringException('minLength and maxLength must be non-negative integers');
    }
    if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
      throw new InvalidStringException('minLength cannot be greater than maxLength');
    }
    if (typeof this._value !== 'string') throw new InvalidStringException('value must be a string');
    if (minLength !== undefined && this._value.length < minLength) {
      throw new InvalidStringException(`length must be at least ${minLength}`);
    }
    if (maxLength !== undefined && this._value.length > maxLength) {
      throw new InvalidStringException(`length must be at most ${maxLength}`);
    }
    if (pattern !== undefined) {
      pattern.lastIndex = 0;
      if (!pattern.test(this._value)) throw new InvalidStringException(`value does not match ${pattern}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
