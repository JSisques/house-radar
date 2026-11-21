# Delta Spec: workspace-task-pipeline

Change: `m0-prettier-husky-commitlint` (GitHub issue #18, S-M0-03). Type: modifies existing capability `workspace-task-pipeline` (main spec at `openspec/specs/workspace-task-pipeline/spec.md`). Formatting and hook behaviour itself is specified in the new `workspace-formatting-and-hooks` capability.

## MODIFIED Requirements

### Requirement: Root scripts delegate to Turborepo

The root `package.json` MUST define the scripts `lint`, `typecheck`, `test`, `build` and `dev`, each delegating to `turbo run <task>` for the task of the same name. It MUST also define `test:changed`, which delegates to `turbo run build test --affected`. The root `package.json` MUST also define `test:workspace`, `lint:root`, `format`, `format:check` and `prepare`, which run directly and MUST NOT delegate to turbo.

(Previously: only `test:workspace` and `lint:root` were exempt from turbo delegation, and `test:changed` did not exist.)

#### Scenario: Root script delegates to turbo

- GIVEN the root `package.json`
- WHEN the scripts `lint`, `typecheck`, `test`, `build` and `dev` are inspected
- THEN each one invokes `turbo run` with the matching task name

#### Scenario: test:changed runs affected build and test

- GIVEN the root `package.json`
- WHEN the script `test:changed` is inspected
- THEN it equals `turbo run build test --affected`

#### Scenario: Non-turbo root scripts run directly

- GIVEN the root `package.json` and `turbo.json`
- WHEN the scripts `test:workspace`, `lint:root`, `format`, `format:check` and `prepare` are inspected
- THEN none of them invokes turbo
- AND no workspace `test` script invokes `test:workspace` (no recursion through `turbo run test`)

### Requirement: Pinned toolchain

The root `package.json` MUST declare `turbo` (2.x), `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort`, the TypeScript import resolver used by boundaries, `prettier`, `husky`, `lint-staged`, `@commitlint/cli` and `@commitlint/config-conventional` as devDependencies with exact versions (no range operators). `typescript` MUST be `5.9.3`.

(Previously: the Prettier, husky, lint-staged and commitlint packages were not required.)

#### Scenario: Exact pins

- GIVEN the root `package.json`
- WHEN the devDependencies `turbo`, `typescript`, the ESLint toolchain packages and the formatting/hook packages are read
- THEN `typescript` equals `5.9.3`
- AND `turbo` is an exact `2.x.y` version without `^` or `~`
- AND every ESLint toolchain package is an exact version without `^` or `~`
- AND `prettier`, `husky`, `lint-staged`, `@commitlint/cli` and `@commitlint/config-conventional` are exact versions without `^` or `~`
