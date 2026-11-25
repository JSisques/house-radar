import { describe, expect, it } from 'vitest';

import { AssertManualListingInputService } from '@contexts/ingestion/application/services/assert-manual-listing-input/assert-manual-listing-input.service';
import { MissingManualListingFieldsException } from '@contexts/ingestion/domain/exceptions/missing-manual-listing-fields/missing-manual-listing-fields.exception';

describe('AssertManualListingInputService', () => {
  const service = new AssertManualListingInputService();

  it('returns the required fields when both are present', () => {
    expect(service.execute({ url: 'https://example.com/a', priceCents: 0 })).toEqual({
      url: 'https://example.com/a',
      priceCents: 0,
    });
  });

  it('reports every missing field at once (HR-F001-AC2)', () => {
    expect.assertions(2);
    try {
      service.execute({ url: '  ' });
    } catch (error) {
      expect(error).toBeInstanceOf(MissingManualListingFieldsException);
      expect((error as MissingManualListingFieldsException).missingFields).toEqual(['url', 'price']);
    }
  });

  it('reports only the missing field', () => {
    expect(() => service.execute({ url: 'https://example.com/a' })).toThrow(MissingManualListingFieldsException);
    try {
      service.execute({ priceCents: 1 });
    } catch (error) {
      expect((error as MissingManualListingFieldsException).missingFields).toEqual(['url']);
    }
  });
});
