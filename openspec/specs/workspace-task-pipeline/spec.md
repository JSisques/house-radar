# Delta Spec: workspace-task-pipeline

Change: `m0-turborepo-workspace` (GitHub issue #16, S-M0-01). Type: new capability (no existing spec to modify).

## Purpose

Defines the root task pipeline and pnpm workspace contract of the monorepo: uniform root scripts, a Turborepo task graph with caching, a strict shared TypeScript baseline, workspace membership (including `apps/docs` compatibility) and the shape of the `@house-radar/building-blocks` placeholder package.

## ADDED Requirements

### Requirement: Root scripts delegate to Turborepo

The root `package.json` MUST define the scripts `lint`, `typecheck`, `test`, `build` and `dev`, each delegating to `turbo run <task>` for the task of the same name. The root `package.json` MUST also define `test:workspace`, which runs the root workspace test suite directly and MUST NOT delegate to turbo.

#### Scenario: Root script delegates to turbo

- GIVEN the root `package.json`
- WHEN the scripts `lint`, `typecheck`, `test`, `build` and `dev` are inspected
- THEN each one invokes `turbo run` with the matching task name

#### Scenario: Workspace suite is outside the turbo pipeline

- GIVEN the root `package.json` and `turbo.json`
- WHEN the `test:workspace` script and the turbo tasks are inspected
- THEN `test:workspace` does not invoke turbo
- AND no workspace `test` script invokes `test:workspace` (no recursion through `turbo run test`)

### Requirement: Pinned toolchain

The root `package.json` MUST declare `turbo` (2.x) and `typescript` as devDependencies with exact versions (no range operators). `typescript` MUST be `5.9.3`.

#### Scenario: Exact pins

- GIVEN the root `package.json`
- WHEN the devDependencies `turbo` and `typescript` are read
- THEN `typescript` equals `5.9.3`
- AND `turbo` is an exact `2.x.y` version without `^` or `~`

### Requirement: Task graph and caching

`turbo.json` MUST use the Turbo 2 `tasks` schema and define:
- `build` depending on `^build`, with `dist/**` in its outputs (and the docs build output);
- `typecheck` depending on `^build`;
- `test` depending on `^build`;
- `lint` as a defined task that is a no-op until a workspace declares a `lint` script;
- `dev` with `persistent: true` and `cache: false`.

Workspaces lacking a script for a task MUST be skipped without requiring stub scripts. `.turbo` and `dist` MUST be ignored by git.

#### Scenario: Task shape in turbo.json

- GIVEN `turbo.json`
- WHEN its `tasks` are inspected
- THEN `build`, `typecheck` and `test` each list `^build` in `dependsOn`
- AND `build` outputs include `dist/**`
- AND `dev` has `persistent: true` and `cache: false`
- AND a `lint` task is present

#### Scenario: Lint is a no-op until defined

- GIVEN no workspace defines a `lint` script
- WHEN `pnpm lint` is run
- THEN the command exits with code 0
- AND no workspace executes a lint command

#### Scenario: Dev is persistent and uncached

- GIVEN a workspace that defines a `dev` script
- WHEN `pnpm dev` is run
- THEN turbo runs the `dev` task as persistent
- AND the result is never stored in or restored from the cache

#### Scenario: Build artifacts are ignored by git

- GIVEN a completed `turbo run build`
- WHEN `git status` is inspected
- THEN `.turbo` and `dist` directories do not appear as untracked

### Requirement: Fresh clone runs build and typecheck in dependency order with caching (issue AC1)

On a fresh clone, `pnpm install && pnpm turbo run build typecheck` MUST run the tasks of all workspaces in dependency order (a workspace's dependencies' `build` before its own `build`/`typecheck`/`test`). An immediately repeated identical run with unchanged inputs MUST be served from the Turborepo cache.

#### Scenario: Fresh clone runs all workspaces

- GIVEN a fresh clone with an empty turbo cache
- WHEN `pnpm install && pnpm turbo run build typecheck` is run
- THEN the command exits with code 0
- AND `build` and `typecheck` execute in every workspace that defines them (`@house-radar/building-blocks` and `docs`)

#### Scenario: Second run is served from cache

- GIVEN a successful `turbo run build typecheck` run with unchanged inputs
- WHEN the same command is run again
- THEN turbo reports a cache hit for every cacheable task
- AND no task is re-executed

#### Scenario: Dependency order is enforced by the graph

- GIVEN the task graph resolved by `turbo run build typecheck --dry=json`
- WHEN the dependencies of each `typecheck` and `test` task are inspected
- THEN each lists the `build` tasks of the workspace's workspace-dependencies as dependencies
- AND this ordering holds for any future workspace dependency edge, since no real edge exists yet

### Requirement: Strict TypeScript failure is reported with the package name (issue AC2)

`pnpm typecheck` MUST exit non-zero when any participating workspace has a strict TypeScript error, and its output MUST identify the failing workspace by package name.

#### Scenario: Strict TS error fails typecheck

- GIVEN `@house-radar/building-blocks` contains a source file with a strict TypeScript error (for example a type mismatch or an implicit `any`)
- WHEN `pnpm typecheck` is run
- THEN the command exits with a non-zero code
- AND the output names `@house-radar/building-blocks`

#### Scenario: Index access is checked strictly

- GIVEN a source file that uses an array index result as a definitely-defined value
- WHEN `pnpm typecheck` is run
- THEN the command fails because `noUncheckedIndexedAccess` is enabled in the shared baseline

### Requirement: Strict shared TypeScript baseline

`tsconfig.base.json` at the repository root MUST enable `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck` and `declaration`, and MUST set `target` to `ES2022`, `module` to `ESNext` and `moduleResolution` to `Bundler`. It MUST NOT set decorator flags. TypeScript workspaces under `packages/*` MUST extend it. `apps/docs` MUST keep extending Astro's strict config and MUST NOT be forced onto the base.

#### Scenario: Base compiler options

- GIVEN `tsconfig.base.json`
- WHEN its `compilerOptions` are read
- THEN `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck` and `declaration` are `true`
- AND `target` is `ES2022`, `module` is `ESNext`, `moduleResolution` is `Bundler`
- AND neither `experimentalDecorators` nor `emitDecoratorMetadata` is set

#### Scenario: Docs tsconfig unchanged

- GIVEN `apps/docs/tsconfig.json`
- WHEN its `extends` is read
- THEN it still extends `astro/tsconfigs/strict`

### Requirement: Workspace membership and docs compatibility (issue AC3)

`pnpm-workspace.yaml` MUST list the `apps/*` and `packages/*` globs. `apps/docs` MUST be a workspace member that participates in the `typecheck` task via an additive `typecheck` script (`astro check`). All existing root `docs:*` scripts (`docs:dev`, `docs:build`, `docs:check`, `docs:test`, `docs:check-i18n`) and the existing `apps/docs` scripts MUST remain functionally unchanged. `check:i18n` MUST remain outside the turbo pipeline.

#### Scenario: Docs is a workspace member

- GIVEN `pnpm-workspace.yaml` and `apps/docs/package.json`
- WHEN workspace packages are listed
- THEN `apps/*` and `packages/*` are included
- AND `docs` appears as a workspace member

#### Scenario: Existing docs scripts keep working

- GIVEN the root `package.json` after the change
- WHEN the scripts `docs:dev`, `docs:build`, `docs:check`, `docs:test` and `docs:check-i18n` are read
- THEN each is identical to its value before the change
- AND `pnpm docs:build`, `pnpm docs:check`, `pnpm docs:test` and `pnpm docs:check-i18n` still exit with code 0

#### Scenario: Docs joins typecheck additively

- GIVEN `apps/docs/package.json`
- WHEN its scripts are read
- THEN `typecheck` is `astro check`
- AND all previous scripts (`dev`, `build`, `preview`, `astro`, `test`, `check:i18n`) are still present with unchanged values

### Requirement: building-blocks placeholder package

`packages/building-blocks` MUST exist as a private ESM workspace package named `@house-radar/building-blocks` at version `0.0.0`. It MUST provide `build` (`tsc -p tsconfig.build.json`, emitting to `dist/`), `typecheck` (`tsc --noEmit`) and `test` (`vitest run --passWithNoTests`) scripts, with Vitest as an exact-pinned devDependency. Its `tsconfig.json` MUST extend `../../tsconfig.base.json`, and a `tsconfig.build.json` MUST exist. It MUST contain exactly one explicit, non-barrel source file (a package marker constant) and no `index.ts` re-export barrel.

#### Scenario: Manifest shape

- GIVEN `packages/building-blocks/package.json`
- WHEN it is read
- THEN `name` is `@house-radar/building-blocks`, `private` is `true`, `type` is `module` and `version` is `0.0.0`
- AND `build`, `typecheck` and `test` scripts have the specified commands

#### Scenario: Build emits to dist

- GIVEN the package source marker file
- WHEN `pnpm --filter @house-radar/building-blocks build` is run
- THEN the command exits with code 0
- AND compiled output exists under `packages/building-blocks/dist/`

#### Scenario: Test passes without specs

- GIVEN `packages/building-blocks` contains no `*.spec.ts` files
- WHEN `pnpm --filter @house-radar/building-blocks test` is run
- THEN Vitest runs with `--passWithNoTests`
- AND the command exits with code 0

#### Scenario: Root test runs through turbo

- GIVEN `@house-radar/building-blocks` (Vitest) and `docs` (`node --test`) define `test` scripts
- WHEN `pnpm test` is run
- THEN turbo executes both workspaces' `test` scripts
- AND the command exits with code 0

### Requirement: Workspace test suite and clean tree

The root workspace suite (run by `pnpm test:workspace`, using `node:test`) MUST assert the configuration contract of this capability and MUST include scoped CLI behaviour tests that (a) run `turbo run build typecheck --filter=@house-radar/building-blocks` with an isolated `TURBO_CACHE_DIR`, asserting a cache miss followed by a cache hit, and (b) create a temporary broken-TypeScript fixture, assert that `typecheck` fails naming the package, and remove the fixture in a `finally` block. The suite MUST leave the git working tree clean.

#### Scenario: Behaviour tests prove cache hit

- GIVEN an empty temporary `TURBO_CACHE_DIR`
- WHEN `turbo run build typecheck --filter=@house-radar/building-blocks` is run twice
- THEN the first run reports a cache miss
- AND the second run reports a cache hit

#### Scenario: Behaviour tests prove failure naming

- GIVEN the suite creates a temporary broken-TypeScript fixture in the package
- WHEN `typecheck` is run for that package
- THEN it fails and its output names `@house-radar/building-blocks`
- AND the fixture is removed afterwards even if an assertion fails

#### Scenario: Suite leaves a clean tree

- GIVEN a clean git working tree
- WHEN `pnpm test:workspace` completes (pass or fail)
- THEN `git status --porcelain` reports no new or modified tracked/untracked files attributable to the suite (ignored `.turbo` and `dist` excepted)

### Requirement: Conventions documentation parity

The `## Tooling` section of `apps/docs/src/content/docs/architecture/conventions.md` MUST describe the Turborepo tasks, the root scripts, the strict base tsconfig and `test:workspace`, and its Spanish mirror under `apps/docs/src/content/docs/es/` MUST be updated equivalently.

#### Scenario: EN/ES parity holds

- GIVEN the updated English and Spanish conventions pages
- WHEN `pnpm docs:check-i18n` is run
- THEN it exits with code 0

## Out of Scope

ESLint, Prettier, import sorting, git hooks (husky, lint-staged, commitlint), CI workflow changes (including path filters and running turbo in CI), Docker, remote caching, real content in `building-blocks`, `packages/shared-kernel`, moving `check:i18n` into turbo, and bundler selection (tsc is the build tool).

## Assumptions

- Vitest is wired in `building-blocks` now (resolves the open question in explore; per proposal).
- Cache-hit evidence is verified through the scoped `--filter` CLI test; the full-workspace run (including `astro build`) is verified manually/at verify phase.
- Only one real workspace dependency edge does not exist yet, so ordering is evidenced via the `--dry=json` graph.
