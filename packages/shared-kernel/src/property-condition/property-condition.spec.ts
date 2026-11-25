import { describe, expect, it } from 'vitest';

import { InvalidPropertyConditionException } from './invalid-property-condition.exception';
import { PROPERTY_CONDITION_VALUES, PropertyCondition } from './property-condition';

describe('PropertyCondition', () => {
  it('accepts every value of the closed list (HR-F002-BR13)', () => {
    expect(PROPERTY_CONDITION_VALUES).toEqual(['new_build', 'good_condition', 'to_renovate', 'unknown']);
    for (const value of PROPERTY_CONDITION_VALUES) expect(new PropertyCondition(value).toPrimitives()).toBe(value);
  });

  it('rejects a condition outside the closed list (HR-F002-AC12)', () => {
    expect(() => new PropertyCondition('ruined')).toThrow(InvalidPropertyConditionException);
  });
});
