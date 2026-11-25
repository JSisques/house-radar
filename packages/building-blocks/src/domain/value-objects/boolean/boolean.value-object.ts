import { ValueObject } from '../value-object';
import { InvalidBooleanException } from './invalid-boolean.exception';

export class BooleanValueObject extends ValueObject<boolean> {
  constructor(value: boolean) {
    super(value, undefined);
  }

  get value(): boolean {
    return this._value;
  }

  protected validate(): void {
    if (typeof this._value !== 'boolean') throw new InvalidBooleanException('value must be a boolean');
  }

  toPrimitives(): boolean {
    return this._value;
  }
}
