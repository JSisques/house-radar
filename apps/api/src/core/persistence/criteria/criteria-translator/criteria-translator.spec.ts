import { describe, expect, it } from 'vitest';

import { Criteria } from '@house-radar/building-blocks';

import { translateCriteria } from '@core/persistence/criteria/criteria-translator/criteria-translator.js';

const columns = { source: 'sourceId', addedAt: 'firstSeenAt' };

describe('translateCriteria', () => {
  it('should map filters to the row property and operator', () => {
    const criteria = new Criteria()
      .addFilter({ field: 'source', operator: 'in', value: ['a', 'b'] })
      .addFilter({ field: 'addedAt', operator: 'gte', value: 1 })
      .addFilter({ field: 'addedAt', operator: 'lt', value: 9 });

    expect(translateCriteria(criteria, columns, 20).where).toEqual({
      sourceId: { $in: ['a', 'b'] },
      firstSeenAt: { $gte: 1, $lt: 9 },
    });
  });

  it('should wrap a contains value in wildcards', () => {
    const criteria = new Criteria().addFilter({ field: 'source', operator: 'contains', value: 'ideal' });

    expect(translateCriteria(criteria, columns, 20).where).toEqual({ sourceId: { $like: '%ideal%' } });
  });

  it('should map sorts and paginate from one', () => {
    const criteria = new Criteria()
      .addSort({ field: 'addedAt', direction: 'desc' })
      .paginate({ page: 3, pageSize: 10 });

    expect(translateCriteria(criteria, columns, 20)).toMatchObject({
      orderBy: [{ firstSeenAt: 'desc' }],
      limit: 10,
      offset: 20,
    });
  });

  it('should use the default page size without pagination', () => {
    expect(translateCriteria(new Criteria(), columns, 20)).toMatchObject({ limit: 20, offset: 0, orderBy: [] });
  });
});
