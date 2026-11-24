import { describe, expect, it } from 'vitest';

import { greet } from './greeting';

describe('greet (unit)', () => {
  it('greets by name', () => {
    expect(greet('Radar')).toBe('Hello, Radar!');
  });
});
