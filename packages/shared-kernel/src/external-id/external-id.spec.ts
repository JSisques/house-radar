import { describe, expect, it } from 'vitest';

import { ExternalId } from './external-id';
import { InvalidExternalIdException } from './invalid-external-id.exception';

describe('ExternalId', () => {
  it('stores a non-empty trimmed identifier', () => {
    expect(new ExternalId('184723').value).toBe('184723');
  });

  it.each(['', '   ', '184723 '])('rejects %j', (value) => {
    expect(() => new ExternalId(value)).toThrow(InvalidExternalIdException);
  });
});
