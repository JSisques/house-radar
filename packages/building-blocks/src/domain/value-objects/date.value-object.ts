import { InvalidDateException } from './invalid-date.exception';
import { ValueObject } from './value-object';

export interface DateValueObjectOptions {
  min?: Date;
  max?: Date;
}

const isValidDate = (d: unknown): d is Date => d instanceof Date && !Number.isNaN(d.getTime());

/** Immutable: copies the source Date on the way in and on the way out. */
export class DateValueObject extends ValueObject<Date, DateValueObjectOptions> {
  constructor(value: Date, options: DateValueObjectOptions = {}) {
    super(value instanceof Date ? new Date(value.getTime()) : value, options);
  }

  get value(): Date {
    return new Date(this._value.getTime());
  }

  protected validate(): void {
    const { min, max } = this.options;
    if ((min !== undefined && !isValidDate(min)) || (max !== undefined && !isValidDate(max))) {
      throw new InvalidDateException('min and max must be valid dates');
    }
    if (min !== undefined && max !== undefined && min.getTime() > max.getTime()) {
      throw new InvalidDateException('min cannot be after max');
    }
    if (!isValidDate(this._value)) throw new InvalidDateException('value must be a valid Date');
    if (min !== undefined && this._value.getTime() < min.getTime()) {
      throw new InvalidDateException(`value must not be before ${min.toISOString()}`);
    }
    if (max !== undefined && this._value.getTime() > max.getTime()) {
      throw new InvalidDateException(`value must not be after ${max.toISOString()}`);
    }
  }

  toPrimitives(): string {
    return this._value.toISOString();
  }
}
