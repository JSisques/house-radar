import { describe, expect, it } from 'vitest';

import { known, UNKNOWN } from './known';
import { maybeToPrimitives } from './maybe-primitives';

describe('maybeToPrimitives', () => {
  it('keeps the mapped value and the origin of a known datum', () => {
    expect(maybeToPrimitives(known(1998, 'declared'), (year) => year + 1)).toEqual({
      kind: 'known',
      value: 1999,
      origin: 'declared',
    });
    expect(maybeToPrimitives(known(2000, 'calculated'), (n) => n)).toEqual({
      kind: 'known',
      value: 2000,
      origin: 'calculated',
    });
  });

  it('leaves an unknown datum unknown without calling the mapper', () => {
    let calls = 0;
    const result = maybeToPrimitives(UNKNOWN, () => {
      calls += 1;
      return 0;
    });

    expect(result).toEqual({ kind: 'unknown' });
    expect(calls).toBe(0);
  });
});
