import { describe, expect, it } from 'vitest';

import { Criteria } from './criteria';

describe('Criteria', () => {
  it('returns a new instance when a filter is added and leaves the original unchanged', () => {
    const original = new Criteria();
    const next = original.addFilter({ field: 'price', operator: 'lte', value: 200000 });

    expect(next).not.toBe(original);
    expect(original.filters).toHaveLength(0);
    expect(next.filters).toEqual([{ field: 'price', operator: 'lte', value: 200000 }]);
  });

  it('returns a new instance when a sort is added or pagination is set', () => {
    const original = new Criteria();
    const sorted = original.addSort({ field: 'price', direction: 'asc' });
    const paged = sorted.paginate({ page: 2, pageSize: 20 });

    expect(original.sorts).toHaveLength(0);
    expect(sorted.pagination).toBeNull();
    expect(paged.sorts).toEqual([{ field: 'price', direction: 'asc' }]);
    expect(paged.pagination).toEqual({ page: 2, pageSize: 20 });
  });

  it('cannot be mutated from outside', () => {
    const criteria = new Criteria().addFilter({ field: 'a', operator: 'eq', value: 1 });
    expect(() => (criteria.filters as unknown as unknown[]).push({})).toThrow(TypeError);
  });
});
