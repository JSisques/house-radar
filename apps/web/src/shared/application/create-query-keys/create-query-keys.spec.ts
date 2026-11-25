import { describe, expect, it } from 'vitest';

import { createQueryKeys } from './create-query-keys';

describe('createQueryKeys', () => {
  const keys = createQueryKeys('search');

  it('should scope every key under the context name', () => {
    expect(keys.all).toEqual(['search']);
    expect(keys.lists()).toEqual(['search', 'list']);
    expect(keys.list({ minPrice: 100 })).toEqual(['search', 'list', { minPrice: 100 }]);
    expect(keys.details()).toEqual(['search', 'detail']);
    expect(keys.detail('abc')).toEqual(['search', 'detail', 'abc']);
  });

  it('should nest list and detail keys under their parents so they can be invalidated together', () => {
    expect(keys.list({}).slice(0, keys.lists().length)).toEqual(keys.lists());
    expect(keys.detail('abc').slice(0, keys.details().length)).toEqual(keys.details());
  });

  it('should keep factories of different contexts apart', () => {
    expect(createQueryKeys('favorites').all).not.toEqual(keys.all);
  });
});
