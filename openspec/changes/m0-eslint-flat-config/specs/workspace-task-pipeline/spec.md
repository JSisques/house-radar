# Delta Spec: workspace-task-pipeline

Change: `m0-eslint-flat-config` (GitHub issue #17, S-M0-02). Type: modifies existing capability `workspace-task-pipeline` (main spec at `openspec/specs/workspace-task-pipeline/spec.md`). Lint behaviour itself is specified in the new `workspace-linting` capability.

## MODIFIED Requirements

### Requirement: Pinned toolchain

The root `package.json` MUST declare `turbo` (2.x), `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort` and the TypeScript import resolver used by boundaries as devDependencies with exact versions (no range operators). `typescript` MUST be `5.9.3`.

(Previously: only `turbo` and `typescript` were required.)

#### Scenario: Exact pins

- GIVEN the root `package.json`
- WHEN the devDependencies `turbo`, `typescript` and the ESLint toolchain packages are read
- THEN `typescript` equals `5.9.3`
- AND `turbo` is an exact `2.x.y` version without `^` or `~`
- AND every ESLint toolchain package is an exact version without `^` or `~`

### Requirement: Task graph and caching

`turbo.json` MUST use the Turbo 2 `tasks` schema and define:
- `build` depending on `^build`, with `dist/**` in its outputs (and the docs build output);
- `typecheck` depending on `^build`;
- `test` depending on `^build`;
- `lint` as a defined task whose `inputs` include `$TURBO_DEFAULT$` and the root `eslint.config.js` (via `$TURBO_ROOT$/eslint.config.js`, or `globalDependencies` as fallback), executed in each workspace that declares a `lint` script;
- `dev` with `persistent: true` and `cache: false`.

Workspaces lacking a script for a task MUST be skipped without requiring stub scripts. `.turbo` and `dist` MUST be ignored by git.

(Previously: `lint` was a no-op until a workspace declared a `lint` script.)

#### Scenario: Task shape in turbo.json

- GIVEN `turbo.json`
- WHEN its `tasks` are inspected
- THEN `build`, `typecheck` and `test` each list `^build` in `dependsOn`
- AND `build` outputs include `dist/**`
- AND `dev` has `persistent: true` and `cache: false`
- AND a `lint` task is present whose inputs include the root `eslint.config.js`

#### Scenario: Lint runs ESLint in each workspace

- GIVEN `@house-radar/building-blocks` and `docs` define `lint` as `eslint .`
- WHEN `pnpm lint` is run
- THEN turbo executes `eslint .` in both workspaces
- AND the command exits with code 0

#### Scenario: Dev is persistent and uncached

- GIVEN a workspace that defines a `dev` script
- WHEN `pnpm dev` is run
- THEN turbo runs the `dev` task as persistent
- AND the result is never stored in or restored from the cache

#### Scenario: Build artifacts are ignored by git

- GIVEN a completed `turbo run build`
- WHEN `git status` is inspected
- THEN `.turbo` and `dist` directories do not appear as untracked

### Requirement: Strict shared TypeScript baseline

`tsconfig.base.json` at the repository root MUST enable `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck` and `declaration`, and MUST set `target` to `ES2022`, `module` to `ESNext` and `moduleResolution` to `Bundler`. It MUST declare `paths` for the aliases `@contexts/*`, `@core/*` and `@shared/*`, resolved relative to each extending project. It MUST NOT set decorator flags. TypeScript workspaces under `packages/*` MUST extend it. `apps/docs` MUST keep extending Astro's strict config and MUST NOT be forced onto the base.

(Previously: no path aliases were declared.)

#### Scenario: Base compiler options

- GIVEN `tsconfig.base.json`
- WHEN its `compilerOptions` are read
- THEN `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck` and `declaration` are `true`
- AND `target` is `ES2022`, `module` is `ESNext`, `moduleResolution` is `Bundler`
- AND neither `experimentalDecorators` nor `emitDecoratorMetadata` is set

#### Scenario: Base declares path aliases

- GIVEN `tsconfig.base.json`
- WHEN `compilerOptions.paths` is read
- THEN `@contexts/*`, `@core/*` and `@shared/*` are declared

#### Scenario: Typecheck still passes with aliases

- GIVEN `packages/building-blocks` extends the base with the new `paths`
- WHEN `pnpm typecheck` is run
- THEN the command exits with code 0

#### Scenario: Docs tsconfig unchanged

- GIVEN `apps/docs/tsconfig.json`
- WHEN its `extends` is read
- THEN it still extends `astro/tsconfigs/strict`

### Requirement: Root scripts delegate to Turborepo

The root `package.json` MUST define the scripts `lint`, `typecheck`, `test`, `build` and `dev`, each delegating to `turbo run <task>` for the task of the same name. The root `package.json` MUST also define `test:workspace` and `lint:root`, which run directly and MUST NOT delegate to turbo.

(Previously: only `test:workspace` was exempt from turbo delegation.)

#### Scenario: Root script delegates to turbo

- GIVEN the root `package.json`
- WHEN the scripts `lint`, `typecheck`, `test`, `build` and `dev` are inspected
- THEN each one invokes `turbo run` with the matching task name

#### Scenario: Workspace suite and root lint are outside the turbo pipeline

- GIVEN the root `package.json` and `turbo.json`
- WHEN the `test:workspace` and `lint:root` scripts and the turbo tasks are inspected
- THEN neither `test:workspace` nor `lint:root` invokes turbo
- AND no workspace `test` script invokes `test:workspace` (no recursion through `turbo run test`)

## REMOVED Requirements

None as whole requirements. The scenario "Lint is a no-op until defined" (under "Task graph and caching") is REMOVED: it no longer holds because `lint` now runs ESLint in every workspace that declares it; it is replaced by "Lint runs ESLint in each workspace".

## Out of Scope (updated)

The "ESLint, Prettier, import sorting" exclusion of the main spec no longer applies to ESLint and import sorting (now `workspace-linting`). Prettier, git hooks and CI changes remain out of scope.
