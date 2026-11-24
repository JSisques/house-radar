import { defineConfig } from 'vitest/config';

// Entry point for IDE and root-level runs. Package tasks use their own `vitest.config.ts` through turbo.
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts', 'apps/*/vitest.config.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
});
