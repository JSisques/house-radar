# Proposal: ESLint flat config with boundaries and import sorting (S-M0-02)

Source: GitHub issue #17 (S-M0-02, depends on #16 / S-M0-01, archived as `m0-turborepo-workspace`). Exploration: Engram `sdd/m0-eslint-flat-config/explore`.

## Intent

The conventions (`apps/docs/src/content/docs/architecture/conventions.md`) promise lint-enforced rules: DDD layer boundaries, context isolation, no `any`, no `../` imports, and a fixed import order. Today nothing enforces them: there is no ESLint in the repository, the turbo `lint` task is a no-op, and `tsconfig.base.json` declares none of the documented aliases. This change makes those rules real before the first real package (building-blocks, shared-kernel, api, ingestion) lands, so every later story inherits them instead of retrofitting them.

Success means: a domain file importing infrastructure fails lint with a boundaries error, a `../x` import fails, unsorted imports are reordered by `eslint --fix` into the documented groups, an explicit `any` fails, and `pnpm lint` runs ESLint in every workspace through turbo.

## Scope

### In Scope
- Root `eslint.config.js` (flat config, ESM), shared by all workspaces, with ESLint and plugins as root devDependencies pinned to exact versions (verified with `npm view` at apply time): `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort`, and a TypeScript import resolver for boundaries (`eslint-import-resolver-typescript`, subject to verification).
- Rules:
  - `eslint-plugin-boundaries` element types for the layers `domain`, `application`, `infrastructure`, `transport` (captured per context), plus `core` and `shared`; layer dependency rules (domain depends on nothing outward; application on domain; infrastructure and transport inward only) and context isolation (only `infrastructure/adapters` may import another context).
  - `@typescript-eslint/no-explicit-any` as an error.
  - `no-restricted-imports` forbidding parent-relative (`../`) imports.
  - `simple-import-sort/imports` (and `exports`) with groups: Node built-ins, external packages, `@house-radar/*`, internal aliases (`@contexts/*`, `@core/*`, `@shared/*`), same-directory relative.
- `tsconfig.base.json`: add `paths` for `@contexts/*`, `@core/*`, `@shared/*` (user decision), resolved per extending project (recommended: TypeScript `${configDir}` template, e.g. `${configDir}/src/contexts/*`, verified at apply).
- Per-workspace `"lint": "eslint ."` in `packages/building-blocks` and `apps/docs` (docs lints `.ts`/`.mjs` only; no Astro plugin).
- `turbo.json`: `lint` task `inputs` include `$TURBO_DEFAULT$` and `$TURBO_ROOT$/eslint.config.js` (fallback: add it to `globalDependencies`), so editing the shared config invalidates lint caches.
- Committed fixtures under `tests/lint-fixtures/` (one intentionally broken fixture per rule, plus a fixture `tsconfig.json` extending the base so aliases resolve), ignored by normal lint runs.
- Lint behaviour test in `tests/workspace/` (`node:test`, run by `pnpm test:workspace`) using the ESLint Node API: asserts the boundaries, `../`, and `any` errors on their fixtures, and that `--fix` output of the unsorted fixture matches the expected order (computed in memory, fixture files never rewritten).
- Workspace config assertions extended (root devDeps pinned, per-package `lint` scripts, turbo `lint` inputs, base `paths`).
- Docs: update the Tooling section of `conventions.md` (EN) and its `es/` mirror, keeping `pnpm docs:check-i18n` green.

### Out of Scope
- Prettier, husky, lint-staged, commitlint (later M0 stories).
- Per-app layer folders (`src/contexts/...` real code), NestJS/React apps.
- `.astro` file linting (`eslint-plugin-astro`).
- Type-aware (`projectService`) lint rules beyond what `no-explicit-any` needs.
- CI workflow changes (running lint in CI, path filters).

## Capabilities

### New Capabilities
- `workspace-linting`: Shared ESLint flat config contract: rule set (boundaries layers and context isolation, no explicit `any`, no parent-relative imports, import sort groups), alias resolution, fixture-based lint behaviour tests, per-workspace `lint` scripts, and lint cache invalidation on shared config changes.

### Modified Capabilities
- `workspace-task-pipeline`: the "Lint is a no-op until defined" scenario no longer holds (`lint` now runs ESLint in each workspace and its inputs include the root config); the strict shared TypeScript baseline gains the `@contexts/*`, `@core/*`, `@shared/*` path aliases; the pinned toolchain gains the ESLint packages.

## Approach

Exploration recommendation, as decided:

1. Strict TDD: write the `node:test` lint test and committed fixtures first (RED: ESLint missing / rules absent), plus config assertions; then add dependencies and config until green.
2. One root flat config, applied by each workspace's `eslint .` (ESLint 9+ finds the nearest `eslint.config.js` walking up). `typescript-eslint` parses TS; `@eslint/js` recommended as base.
3. Boundaries resolve aliases through the TypeScript resolver reading the fixture/workspace `tsconfig.json`; element patterns are path-based (`**/contexts/*/domain/**`, etc.) so they work for fixtures now and for real apps later.
4. Fixtures live in `tests/lint-fixtures/` and are excluded via `ignores` in the root config; the test lints them with an ESLint instance that overrides the ignore (`ignore: false` or explicit config), so `pnpm lint` stays green while the test proves each rule fires.
5. Turbo lint caching keyed on the shared root config.
6. Docs EN/ES update.

Rationale: a single shared config keeps rules uniform with one place to change; testing through the ESLint Node API is fast and deterministic and avoids spawning per-rule CLIs; committed fixtures make each acceptance criterion an explicit, reviewable example.

## Resolved Decisions

- **Root files linting** (`tests/`, `eslint.config.js`, other root `.mjs`): turbo `lint` only covers workspaces, so root files are not linted by it. Decision (user-approved): add a root `lint:root` script (`eslint tests eslint.config.js`, fixtures still ignored) run outside turbo, mirroring `test:workspace`; the root does not become a turbo workspace.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `eslint.config.js` | New | Shared flat config |
| `package.json` | Modified | Exact-pinned ESLint devDeps; possibly `lint:root` |
| `tsconfig.base.json` | Modified | `paths` for `@contexts/*`, `@core/*`, `@shared/*` |
| `turbo.json` | Modified | `lint.inputs` with root config |
| `packages/building-blocks/package.json` | Modified | `lint` script |
| `apps/docs/package.json` | Modified | `lint` script (ts/mjs only) |
| `tests/lint-fixtures/**` | New | One broken fixture per rule + fixture tsconfig |
| `tests/workspace/lint.test.mjs` | New | ESLint Node API behaviour tests |
| `tests/workspace/config.test.mjs` | Modified | New config assertions |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modified | Tooling section |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modified | ES mirror |
| `openspec/config.yaml` | Modified (at verify/archive) | Linter commands per project |
| `pnpm-lock.yaml` | Modified (generated) | Excluded from forecast |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Package versions and ESLint 9/10 flat-config compatibility unverified (no registry access during explore) | Med | `npm view` each package at apply; pin exact versions that support the installed ESLint major |
| `paths` in a base tsconfig resolve relative to the base file, not the extending project | Med | Use `${configDir}` (TS >= 5.5, repo pins 5.9.3); assert resolution in the lint test via fixture tsconfig |
| Boundaries does not resolve aliases (resolver misconfigured), so the domain→infrastructure test passes vacuously or fails for the wrong reason | Med | Test asserts the specific `boundaries/*` rule id, and includes both alias and same-dir relative cases |
| Fixtures leak into `pnpm lint` and break it | Low | Root `ignores`; test asserts `pnpm lint` scope excludes fixtures |
| Existing docs `.ts`/`.mjs` files or building-blocks marker fail new rules | Low | Fix in the same slice; few files exist |
| Diff exceeds the 400-line budget | Med | See forecast; auto-chain slicing if exceeded |

## Rollback Plan

Additive tooling. Revert the work-unit commit(s) with `git revert` and run `pnpm install` to restore the lockfile. Removing `eslint.config.js`, the fixtures, the lint test, the per-package `lint` scripts, the turbo `lint.inputs` entry and the base `paths` returns `pnpm lint` to the previous no-op behaviour; no runtime code or docs build path depends on ESLint.

## Dependencies

- #16 / S-M0-01 (turbo pipeline, `tsconfig.base.json`, `test:workspace`), archived.
- npm registry access at apply to verify and install exact versions.
- Node >= 24, pnpm 10.34.6, TypeScript 5.9.3.

## Success Criteria

- [ ] AC1: A domain file importing an infrastructure file fails lint with a `boundaries` rule error.
- [ ] AC2: A `../x` import fails lint via `no-restricted-imports`.
- [ ] AC3: `eslint --fix` reorders an unsorted fixture into built-ins, external, `@house-radar/*`, aliases, relative.
- [ ] AC4: An explicit `any` in a type fails with `@typescript-eslint/no-explicit-any`.
- [ ] `pnpm lint` runs ESLint in every workspace and exits 0 on the current tree; changing `eslint.config.js` invalidates the lint cache.
- [ ] `pnpm test:workspace` passes, including the lint behaviour tests, and leaves a clean git tree.
- [ ] Conventions Tooling section updated in EN and ES; `pnpm docs:check-i18n` passes.
- [ ] Authored diff forecast ~300–420 lines (config ~100, fixtures ~50, lint test ~120, config assertions ~30, package/turbo/tsconfig ~25, docs EN+ES ~40). Budget risk Medium: under auto-chain, split if needed into slice 1 (deps, config, aliases, scripts, turbo inputs, config assertions) and slice 2 (fixtures, lint behaviour tests, docs).
