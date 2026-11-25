import { describe, expect, it } from 'vitest';

import { InvalidMunicipalityCodeException } from './invalid-municipality-code.exception';
import { MunicipalityCode } from './municipality-code';

describe('MunicipalityCode', () => {
  it('accepts a five-digit INE code', () => {
    expect(new MunicipalityCode('28079').value).toBe('28079');
  });

  it.each(['2807', '280790', 'abcde', '', ' 28079'])('rejects %j', (value) => {
    expect(() => new MunicipalityCode(value)).toThrow(InvalidMunicipalityCodeException);
  });
});
