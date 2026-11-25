import { describe, expect, it } from 'vitest';

import { isNewerVersion } from '@core/persistence/processed-event/aggregate-version-guard.js';

describe('isNewerVersion', () => {
  it('should apply an event when nothing was applied yet', () => {
    expect(isNewerVersion(1, null)).toBe(true);
  });

  it('should apply an event newer than the applied version', () => {
    expect(isNewerVersion(4, 3)).toBe(true);
  });

  it('should ignore an event older than the applied version', () => {
    expect(isNewerVersion(2, 3)).toBe(false);
  });

  it('should ignore an event with the applied version', () => {
    expect(isNewerVersion(3, 3)).toBe(false);
  });
});
