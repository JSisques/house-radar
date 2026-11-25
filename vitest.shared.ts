import type { PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Spec naming convention. Each kind has a disjoint glob so a file belongs to exactly one kind:
 * `*.integration-spec.ts` and `*.e2e-spec.ts` never match `*.spec.{ts,tsx}`.
 */
export const specKinds = {
  unit: ['**/*.spec.{ts,tsx}'],
  integration: ['**/*.integration-spec.ts'],
  // Booted-application specs, run by the `test:e2e` task of each app that has them.
  e2e: ['**/*.e2e-spec.ts'],
} as const;

export type SpecKind = keyof typeof specKinds;

export const coverage = {
  provider: 'v8',
  reporter: ['text-summary', 'lcov'],
  reportsDirectory: 'coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [...Object.values(specKinds).flat(), '**/*.d.ts'],
} as const;

/** Shared base for every package-level config. Never import the root `vitest.config.ts` from a project config. */
export function defineKindConfig(kind: SpecKind, extra: { plugins?: PluginOption[] } = {}) {
  return defineConfig({
    ...extra,
    test: {
      include: [...specKinds[kind]],
      passWithNoTests: true,
      coverage: {
        ...coverage,
        reporter: [...coverage.reporter],
        include: [...coverage.include],
        exclude: [...coverage.exclude],
      },
    },
  });
}
