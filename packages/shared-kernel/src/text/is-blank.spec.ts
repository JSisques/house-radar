import { describe, expect, it } from 'vitest';

import { isBlank } from './is-blank';

describe('isBlank', () => {
  it.each([undefined, null, '', '   ', '\t\n'])('is true for %j', (value) => {
    expect(isBlank(value)).toBe(true);
  });

  it('is false for text with content', () => {
    expect(isBlank(' a ')).toBe(false);
  });
});
