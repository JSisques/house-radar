import { describe, expect, it } from 'vitest';

import { greet } from './greeting';

// Real integration specs talk to external services (Testcontainers helpers land in issue #28).
describe('greet (integration)', () => {
  it('runs only through test:integration', () => {
    expect(greet('Integration')).toBe('Hello, Integration!');
  });
});
