import { InvalidNumberException } from './invalid-number.exception';
import { ValueObject } from './value-object';

export interface NumberValueObjectOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

const isBound = (n: number | undefined): boolean => n === undefined || Number.isFinite(n);

export class NumberValueObject extends ValueObject<number, NumberValueObjectOptions> {
  constructor(value: number, options: NumberValueObjectOptions = {}) {
    super(value, options);
  }

  get value(): number {
    return this._value;
  }

  protected validate(): void {
    const { min, max, integer } = this.options;
    if (!isBound(min) || !isBound(max)) throw new InvalidNumberException('min and max must be finite numbers');
    if (min !== undefined && max !== undefined && min > max) {
      throw new InvalidNumberException('min cannot be greater than max');
    }
    if (typeof this._value !== 'number' || !Number.isFinite(this._value)) {
      throw new InvalidNumberException('value must be a finite number');
    }
    if (integer === true && !Number.isInteger(this._value))
      throw new InvalidNumberException('value must be an integer');
    if (min !== undefined && this._value < min) throw new InvalidNumberException(`value must be at least ${min}`);
    if (max !== undefined && this._value > max) throw new InvalidNumberException(`value must be at most ${max}`);
  }

  toPrimitives(): number {
    return this._value;
  }
}
