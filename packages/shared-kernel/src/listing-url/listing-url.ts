import { ValueObject } from '@house-radar/building-blocks';

import { InvalidListingUrlException } from './invalid-listing-url.exception';

const normalize = (raw: string): string => {
  if (typeof raw !== 'string') throw new InvalidListingUrlException('value must be a string');
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new InvalidListingUrlException('value is not an absolute URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new InvalidListingUrlException('protocol must be http or https');
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
};

/** Absolute http(s) URL of a listing, normalized without query string or fragment (D17). */
export class ListingUrl extends ValueObject<string> {
  constructor(value: string) {
    super(normalize(value));
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    // The value is validated and normalized before construction.
  }

  toPrimitives(): string {
    return this._value;
  }
}
