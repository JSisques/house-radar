import { describe, expect, it } from 'vitest';

import { PaginatedResult } from './paginated-result';

describe('PaginatedResult', () => {
  it('exposes items, totals and the page count', () => {
    const result = new PaginatedResult(['a', 'b'], 5, 1, 2);
    expect(result.items).toEqual(['a', 'b']);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it('does not share the input array', () => {
    const items = ['a'];
    const result = new PaginatedResult(items, 1, 1, 10);
    items.push('b');
    expect(result.items).toEqual(['a']);
  });
});
