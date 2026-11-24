import { describe, expect, it } from 'vitest';

import { greet } from './greeting';

// The `*.e2e-spec.ts` suffix is reserved; no root task runs it until apps/api defines `test:e2e`.
describe('greet (e2e naming)', () => {
  it('documents the reserved suffix', () => {
    expect(greet('E2E')).toBe('Hello, E2E!');
  });
});
