import { describe, expect, it } from 'vitest';

import { InvalidListingUrlException } from './invalid-listing-url.exception';
import { ListingUrl } from './listing-url';

describe('ListingUrl', () => {
  it('strips the query string and the fragment (HR-F001-AC12)', () => {
    const url = new ListingUrl('https://example.com/home/1?ref=a#photos');
    expect(url.value).toBe('https://example.com/home/1');
    expect(url.toPrimitives()).toBe('https://example.com/home/1');
  });

  it('keeps a clean url as is', () => {
    expect(new ListingUrl('https://example.com/home/1').value).toBe('https://example.com/home/1');
  });

  it('compares by normalized value', () => {
    expect(
      new ListingUrl('https://example.com/home/1?a=1').equals(new ListingUrl('https://example.com/home/1#x')),
    ).toBe(true);
  });

  it.each(['', 'not a url', 'ftp://example.com/home/1', 'javascript:alert(1)'])('rejects %j', (value) => {
    expect(() => new ListingUrl(value)).toThrow(InvalidListingUrlException);
  });
});
