import { describe, expect, it } from 'vitest';

import { greet } from './greeting';

// Component specs use the `.spec.tsx` suffix. DOM rendering (jsdom + Testing Library) arrives with apps/web.
describe('greet (component naming)', () => {
  it('is discovered by the *.spec.tsx glob', () => {
    expect(greet('TSX')).toBe('Hello, TSX!');
  });
});
