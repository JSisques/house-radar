# Delta Spec: workspace-linting

Change: `m0-eslint-flat-config` (GitHub issue #17, S-M0-02). Type: new capability.

## Purpose

Defines the shared ESLint flat config contract of the monorepo: DDD layer boundaries and context isolation, no explicit `any`, no parent-relative imports, a fixed import order, alias resolution, fixture-based lint behaviour tests, per-workspace `lint` scripts, a root `lint:root` script and lint cache invalidation on shared config changes.

## ADDED Requirements

### Requirement: Shared root flat config

The repository MUST provide a single ESM flat config at the root `eslint.config.js`, applied to every workspace (each workspace's `eslint .` resolves it by walking up). It MUST use `@eslint/js` recommended and `typescript-eslint` as the TypeScript base. No workspace MUST define its own divergent ESLint config for these rules.

#### Scenario: Workspaces use the root config

- GIVEN `packages/building-blocks` and `apps/docs`
- WHEN `eslint .` is run in each workspace
- THEN the root `eslint.config.js` is the config in effect
- AND no other `eslint.config.*` file exists under `packages/` or `apps/`

### Requirement: Layer boundaries (issue AC1)

The config MUST use `eslint-plugin-boundaries` with element types `domain`, `application`, `infrastructure` and `transport` (captured per context, matched by path patterns such as `**/contexts/*/domain/**`), plus `core` and `shared`. Dependency rules MUST be: `domain` imports nothing from outer layers; `application` may import `domain`; `infrastructure` and `transport` may import inward layers only. Violations MUST be reported under a `boundaries/*` rule id.

#### Scenario: Domain importing infrastructure fails

- GIVEN a fixture file in a `domain` layer that imports a file from an `infrastructure` layer of the same context
- WHEN the fixture is linted
- THEN lint reports an error whose rule id starts with `boundaries/`

#### Scenario: Inward dependency is allowed

- GIVEN a fixture `infrastructure` file that imports a `domain` file of the same context
- WHEN the fixture is linted
- THEN no `boundaries/*` error is reported

#### Scenario: Boundaries do not pass vacuously

- GIVEN the domain-to-infrastructure fixture imports through a `@contexts/*` alias and through a same-directory relative path
- WHEN each case is linted
- THEN the alias case fails with the specific `boundaries/*` rule id (alias is resolved by the TypeScript resolver)
- AND the test asserts the rule id, not merely a non-zero error count

### Requirement: Context isolation

Only the `infrastructure/adapters` layer of a context MAY import from another context. Any other layer importing another context MUST be reported under a `boundaries/*` rule id.

#### Scenario: Cross-context import from application fails

- GIVEN a fixture `application` file of context A importing a file of context B
- WHEN the fixture is linted
- THEN lint reports a `boundaries/*` error

#### Scenario: Cross-context import from an adapter is allowed

- GIVEN a fixture file under `infrastructure/adapters` of context A importing a file of context B
- WHEN the fixture is linted
- THEN no `boundaries/*` error is reported

### Requirement: No parent-relative imports (issue AC2)

The config MUST forbid parent-relative imports (any specifier starting with `../`) through `no-restricted-imports` as an error. Same-directory relative imports (`./x`) MUST remain allowed.

#### Scenario: Parent-relative import fails

- GIVEN a fixture file containing `import { x } from '../x'`
- WHEN the fixture is linted
- THEN lint reports an error with rule id `no-restricted-imports`

#### Scenario: Same-directory import passes

- GIVEN a fixture file containing `import { x } from './x'`
- WHEN the fixture is linted
- THEN no `no-restricted-imports` error is reported

### Requirement: Import sorting (issue AC3)

The config MUST enable `simple-import-sort/imports` and `simple-import-sort/exports` as errors with groups in this order: Node built-ins, external packages, `@house-radar/*`, internal aliases (`@contexts/*`, `@core/*`, `@shared/*`), same-directory relative imports.

#### Scenario: Autofix reorders into documented groups

- GIVEN an unsorted fixture mixing a relative import, an alias import, a `@house-radar/*` import, an external import and a Node built-in
- WHEN the fixture is linted with fix enabled (in memory, the fixture file is not rewritten)
- THEN the fixed output orders imports as built-ins, external, `@house-radar/*`, aliases, relative
- AND the committed fixture file is unchanged

#### Scenario: Unsorted imports are reported

- GIVEN the same unsorted fixture
- WHEN it is linted without fix
- THEN lint reports `simple-import-sort/imports` errors

### Requirement: No explicit any (issue AC4)

The config MUST enable `@typescript-eslint/no-explicit-any` as an error.

#### Scenario: Explicit any fails

- GIVEN a fixture containing `const x: any = 1`
- WHEN the fixture is linted
- THEN lint reports an error with rule id `@typescript-eslint/no-explicit-any`

### Requirement: Path alias resolution

`tsconfig.base.json` MUST declare `paths` for `@contexts/*`, `@core/*` and `@shared/*`, resolved relative to each extending project (not the base file) so every workspace maps them to its own `src/contexts/*`, `src/core/*` and `src/shared/*`. The boundaries import resolver MUST resolve these aliases using the extending project's `tsconfig.json`.

#### Scenario: Aliases declared in the base

- GIVEN `tsconfig.base.json`
- WHEN `compilerOptions.paths` is read
- THEN keys `@contexts/*`, `@core/*` and `@shared/*` are present
- AND each maps into the extending project's `src/` tree

#### Scenario: Alias resolves for a fixture project

- GIVEN a fixture `tsconfig.json` that extends the base config
- WHEN a fixture imports `@contexts/<ctx>/...` and is linted
- THEN boundaries classifies the imported file as an element of its layer (the alias is resolved, not treated as an unknown external package)

### Requirement: Fixtures are committed and excluded from normal lint

One intentionally broken fixture per rule (boundaries, context isolation, `../`, import order, `any`) and a fixture `tsconfig.json` extending the base MUST be committed under `tests/lint-fixtures/`. The root config MUST ignore `tests/lint-fixtures/**` so normal lint runs stay green; the behaviour test MUST lint them with an ESLint instance that overrides that ignore.

#### Scenario: Normal lint ignores fixtures

- GIVEN the committed fixtures under `tests/lint-fixtures/`
- WHEN `pnpm lint` and `pnpm lint:root` are run
- THEN neither reports any error from a fixture file

#### Scenario: Behaviour test lints fixtures despite the ignore

- GIVEN the lint behaviour test using the ESLint Node API with the ignore overridden
- WHEN it lints each fixture
- THEN each fixture produces its expected rule error

### Requirement: Lint behaviour test

A `node:test` file under `tests/workspace/`, run by `pnpm test:workspace`, MUST assert AC1 to AC4 and the allowed-case scenarios above through the ESLint Node API. It MUST compute `--fix` results in memory only and MUST leave the git working tree clean.

#### Scenario: Suite proves every acceptance criterion

- GIVEN the lint behaviour test and the committed fixtures
- WHEN `pnpm test:workspace` is run
- THEN it passes and covers the boundaries, `../`, import sort and `any` cases
- AND `git status --porcelain` reports no changes attributable to the suite

### Requirement: Per-workspace lint scripts

`packages/building-blocks` and `apps/docs` MUST each define a `lint` script `eslint .`. `apps/docs` linting MUST cover `.ts` and `.mjs` files only (no Astro plugin, `.astro` files not linted). `pnpm lint` MUST run ESLint in every workspace that defines the script through turbo and MUST exit 0 on the current tree.

#### Scenario: Lint scripts present

- GIVEN `packages/building-blocks/package.json` and `apps/docs/package.json`
- WHEN their scripts are read
- THEN `lint` equals `eslint .` in both

#### Scenario: pnpm lint runs in every workspace

- GIVEN the current tree
- WHEN `pnpm lint` is run
- THEN turbo executes `lint` in `@house-radar/building-blocks` and `docs`
- AND the command exits with code 0

#### Scenario: Astro files are not linted

- GIVEN `apps/docs` contains `.astro` files
- WHEN `pnpm lint` is run
- THEN no `.astro` file is parsed or reported

### Requirement: Root files linted outside turbo

The root `package.json` MUST define `lint:root` as `eslint tests eslint.config.js`, run directly (not through turbo, the root is not a turbo workspace), with fixtures still ignored. It MUST exit 0 on the current tree.

#### Scenario: lint:root script

- GIVEN the root `package.json`
- WHEN `lint:root` is read
- THEN it equals `eslint tests eslint.config.js`
- AND it does not invoke turbo

#### Scenario: lint:root passes

- GIVEN the current tree
- WHEN `pnpm lint:root` is run
- THEN it exits with code 0

### Requirement: Lint cache invalidates on shared config change

The turbo `lint` task `inputs` MUST include `$TURBO_DEFAULT$` and `$TURBO_ROOT$/eslint.config.js` (or, if that form is unsupported, the file MUST be listed in `globalDependencies`), so editing the root config invalidates every workspace's lint cache.

#### Scenario: Lint inputs declared

- GIVEN `turbo.json`
- WHEN the `lint` task is read
- THEN its `inputs` include `$TURBO_DEFAULT$` and `$TURBO_ROOT$/eslint.config.js` (or `eslint.config.js` is in `globalDependencies`)

#### Scenario: Config edit causes cache miss

- GIVEN a successful `pnpm lint` followed by a second run that is a cache hit
- WHEN `eslint.config.js` is modified and `pnpm lint` is run again
- THEN turbo reports a cache miss for the `lint` task of the workspaces

### Requirement: Exact-pinned lint toolchain

The root `package.json` MUST declare `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort` and the TypeScript import resolver used by boundaries as devDependencies with exact versions (no range operators), each compatible with the installed ESLint major.

#### Scenario: Exact pins

- GIVEN the root `package.json`
- WHEN the lint devDependencies are read
- THEN each is an exact `x.y.z` version without `^` or `~`

### Requirement: Conventions documentation parity

The `## Tooling` section of `apps/docs/src/content/docs/architecture/conventions.md` MUST describe the lint setup (shared config, rules, aliases, `lint` and `lint:root`), and its Spanish mirror under `apps/docs/src/content/docs/es/` MUST be updated equivalently.

#### Scenario: EN/ES parity holds

- GIVEN the updated English and Spanish conventions pages
- WHEN `pnpm docs:check-i18n` is run
- THEN it exits with code 0

## Out of Scope

Prettier, husky, lint-staged, commitlint, real per-app layer code (`src/contexts/...`), NestJS/React apps, `.astro` linting, type-aware (`projectService`) rules beyond `no-explicit-any`, and CI workflow changes.

## Assumptions

- Exact package versions and the resolver choice are verified with `npm view` at apply; the spec fixes only the pinning rule.
- `${configDir}` in `paths` (TypeScript >= 5.5, repo pins 5.9.3) is the intended mechanism; the observable contract is per-project alias resolution.
- Context isolation fixtures use two contexts under a fixture `src/contexts/` tree.
