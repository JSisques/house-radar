import { ValueObject } from '@house-radar/building-blocks';

import { InvalidPropertyConditionException } from './invalid-property-condition.exception';

export const PROPERTY_CONDITION_VALUES = ['new_build', 'good_condition', 'to_renovate', 'unknown'] as const;

export type PropertyConditionValue = (typeof PROPERTY_CONDITION_VALUES)[number];

/** Closed catalog of property conditions (HR-F002-BR13). */
export class PropertyCondition extends ValueObject<string> {
  get value(): PropertyConditionValue {
    return this._value as PropertyConditionValue;
  }

  protected validate(): void {
    if (!(PROPERTY_CONDITION_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidPropertyConditionException(`value must be one of: ${PROPERTY_CONDITION_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
