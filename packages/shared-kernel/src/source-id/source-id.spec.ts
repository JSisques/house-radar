import { describe, expect, it } from 'vitest';

import { InvalidSourceIdException } from './invalid-source-id.exception';
import { SourceId } from './source-id';

describe('SourceId', () => {
  it('stores a non-empty trimmed identifier', () => {
    expect(new SourceId('fotocasa').value).toBe('fotocasa');
  });

  it.each(['', '   ', ' fotocasa'])('rejects %j', (value) => {
    expect(() => new SourceId(value)).toThrow(InvalidSourceIdException);
  });
});
