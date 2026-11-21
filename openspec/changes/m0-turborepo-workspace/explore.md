# Explore: m0-turborepo-workspace

Source: GitHub issue #16 (S-M0-01, Turborepo and pnpm workspace scripts). Engram mirror: `sdd/m0-turborepo-workspace/explore`.

## Current state

- Root `package.json`: private, `packageManager: pnpm@10.34.6`, engines `node>=24`, `pnpm>=10.34.6`. Scripts are only `docs:dev`, `docs:build`, `docs:check`, `docs:test` and `docs:check-i18n`. There is no turbo and there are no devDependencies.
- `pnpm-workspace.yaml` already lists `apps/*` and `packages/*`. Only `apps/docs` exists on disk, and there is no `packages/` directory. `.nvmrc` is `24`. There is no root tsconfig.
- `apps/docs` (name `docs`, ESM): scripts `dev`, `build`, `preview`, `astro`, `test` (`node --test 'scripts/*.test.mjs'`) and `check:i18n`. It has no `lint` and no `typecheck`. Its tsconfig extends `astro/tsconfigs/strict`, and TypeScript 5.9.3 is a devDependency.
- `.github/workflows/docs.yml` calls only the root `docs:*` scripts. Keeping those scripts unchanged is the compatibility contract for AC3. Its path filters ignore `turbo.json` and `tsconfig.base.json`; this is a CI follow-up and out of scope here.

## Binding decisions

- D2: pnpm workspaces + Turborepo. D16: CI runs lint, typecheck, test and build of affected packages through Turborepo. Neither ADR pins a version.
- Packages are framework-free strict TypeScript that runs in the browser, named `@house-radar/<name>`. Barrel files are not allowed. Unit tests use Vitest with `*.spec.ts` (D14).
- The docs do not record a decision on tsc vs tsup or on module resolution. These are design choices.
- Latest `turbo` on npm is 2.11.13 (registry lookup, not verified locally). Turbo 2 uses `tasks`, not `pipeline`.

## Script semantics

- Turbo skips workspaces that lack a script, so no stubs are needed.
- `dev` needs `persistent: true` and `cache: false`.
- Docs gets an additive `"typecheck": "astro check"`, and `docs:check` stays as an alias.
- The root `lint` task is defined but is a no-op until ESLint lands.
- `check:i18n` stays outside turbo.

## Testing approach (Strict TDD)

| Approach | Pros | Cons |
| --- | --- | --- |
| A. Root node:test suite with config assertions | Fast RED, deterministic, follows the existing node:test pattern | Static: it checks configuration, not behaviour |
| B. CLI-spawn behaviour tests (`--dry=json`, `--summarize`, isolated `TURBO_CACHE_DIR`, a broken TS fixture) | Exercises real behaviour | Slower; temporary fixtures inside the workspace can leave a dirty tree |
| C. Manual verification commands only | Cheapest | No automated RED, which violates Strict TDD |

Recommendation: A plus a narrow slice of B, scoped with `--filter` and using a temporary fixture with try/finally cleanup. Keep the suite as a separate root script (`test:workspace`) so it does not recurse into `turbo run test`.

## building-blocks shell

- `packages/building-blocks`, `@house-radar/building-blocks`, private, ESM, version `0.0.0`.
- Built with tsc (`tsc -p tsconfig.build.json` emitting to `dist/`). `typecheck` runs `tsc --noEmit`. Its tsconfig extends `../../tsconfig.base.json`.
- One explicit, non-barrel source file, such as a package marker constant.
- "Dependency order" can only be shown through `^build` in turbo.json and a dry-run graph, because the workspace has no real dependency edge yet.

## Versions and config

- Pin `turbo` (2.x) and `typescript` 5.9.3 exactly as root devDependencies.
- `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck`, `declaration`, ES2022 + ESNext/Bundler. It does not set decorator flags. `apps/docs` keeps extending Astro's strict config.
- Add `.turbo` and `dist` to `.gitignore`.

## Open product question

- Wire Vitest in building-blocks now (`vitest run --passWithNoTests`), or leave `test` undefined until S-M0-02?

## Risks

- The explore phase could not run turbo locally. Neither the AC1/AC2 behaviour nor the turbo version is verified yet.
- Cache tests get slow or flaky if `astro build` is in the graph. Isolate them with `--filter` and a temporary `TURBO_CACHE_DIR`.
- The lockfile diff is generated and is excluded from the line forecast.

## Forecast

About 270-340 authored changed lines, which fits a single slice under the 400-line budget.
