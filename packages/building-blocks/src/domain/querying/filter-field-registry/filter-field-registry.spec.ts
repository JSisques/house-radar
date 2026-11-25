import { describe, expect, it } from 'vitest';

import { Criteria } from '../criteria/criteria';
import { FilterFieldRegistry } from './filter-field-registry';
import { InvalidFilterFieldException } from './invalid-filter-field.exception';

const registry = new FilterFieldRegistry({ price: ['gte', 'lte'], city: ['eq', 'in'] });

describe('FilterFieldRegistry', () => {
  it('accepts allowed fields and operators', () => {
    const criteria = new Criteria()
      .addFilter({ field: 'price', operator: 'lte', value: 1 })
      .addSort({ field: 'city', direction: 'asc' });
    expect(() => registry.assertAllowed(criteria)).not.toThrow();
    expect(registry.has('price')).toBe(true);
  });

  it('rejects an unknown field', () => {
    const criteria = new Criteria().addFilter({ field: 'secret', operator: 'eq', value: 1 });
    expect(() => registry.assertAllowed(criteria)).toThrow(InvalidFilterFieldException);
  });

  it('rejects a disallowed operator', () => {
    const criteria = new Criteria().addFilter({ field: 'city', operator: 'gt', value: 1 });
    expect(() => registry.assertAllowed(criteria)).toThrow(InvalidFilterFieldException);
  });

  it('rejects sorting on an unknown field', () => {
    const criteria = new Criteria().addSort({ field: 'secret', direction: 'desc' });
    expect(() => registry.assertAllowed(criteria)).toThrow(InvalidFilterFieldException);
  });
});
