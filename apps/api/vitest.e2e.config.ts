import swc from 'unplugin-swc';
import { mergeConfig } from 'vitest/config';

import { defineKindConfig } from '../../vitest.shared.ts';

export default mergeConfig(defineKindConfig('e2e', { plugins: [swc.vite()] }), {
  test: {
    // Some e2e specs start Testcontainers (health checks), so they need Docker and a generous timeout.
    globalSetup: ['@house-radar/testing/global-setup'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
