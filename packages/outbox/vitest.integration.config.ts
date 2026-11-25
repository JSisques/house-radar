import { mergeConfig } from 'vitest/config';

import { defineKindConfig } from '../../vitest.shared.ts';

export default mergeConfig(defineKindConfig('integration'), {
  test: {
    globalSetup: ['@house-radar/testing/global-setup'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
