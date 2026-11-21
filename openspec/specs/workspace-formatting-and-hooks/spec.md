# Delta Spec: workspace-formatting-and-hooks

Change: `m0-prettier-husky-commitlint` (GitHub issue #18, S-M0-03). Type: new capability.

## Purpose

Defines the local code-style and commit-hygiene contract of the monorepo: a single root Prettier configuration and ignore list, `format`/`format:check` scripts, husky git hooks installed by `prepare`, a `pre-commit` hook running lint-staged (ESLint fix, then Prettier), a `commit-msg` hook running commitlint with the conventional preset, a `pre-push` hook running `test:changed`, exact-pinned tooling, behaviour tests against the real binaries, and conventions documentation parity.

## ADDED Requirements

### Requirement: Prettier configuration

The repository MUST provide a single root `.prettierrc` with `singleQuote` set to `true`, `trailingComma` set to `"all"` and `printWidth` set to `120`. No workspace MUST define its own divergent Prettier configuration.

#### Scenario: Prettier options

- GIVEN the root `.prettierrc`
- WHEN it is parsed
- THEN `singleQuote` is `true`, `trailingComma` is `"all"` and `printWidth` is `120`

#### Scenario: Options take effect

- GIVEN a TypeScript snippet using double quotes and a multi-line array without a trailing comma
- WHEN Prettier formats it via `--stdin-filepath` pointing inside the repository
- THEN the output uses single quotes
- AND the multi-line array ends with a trailing comma

### Requirement: Prettier ignore list

The repository MUST provide a root `.prettierignore` that mirrors the entries of `.gitignore` and additionally lists `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/` (design reference mockups, not hand-maintained code), `*.md` and `*.mdx`. Ignored paths MUST NOT be modified by `format` and MUST NOT be reported by `format:check`.

#### Scenario: Required ignore entries

- GIVEN `.prettierignore` and `.gitignore`
- WHEN their entries are compared
- THEN every `.gitignore` entry appears in `.prettierignore`
- AND `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/` (design reference mockups, not hand-maintained code), `*.md` and `*.mdx` are listed

#### Scenario: Ignored file is left untouched

- GIVEN a Markdown file or a file under `tests/lint-fixtures/` that is not Prettier-formatted
- WHEN `pnpm format:check` is run
- THEN that file is not reported
- AND running `pnpm format` leaves it unchanged

### Requirement: Format scripts

The root `package.json` MUST define `format` as `prettier --write .` and `format:check` as `prettier --check .`. Both MUST run directly and MUST NOT delegate to turbo. `format:check` MUST exit 0 on a fully formatted tree and non-zero when any non-ignored file is not formatted.

#### Scenario: Script definitions

- GIVEN the root `package.json`
- WHEN the scripts `format` and `format:check` are read
- THEN `format` equals `prettier --write .` and `format:check` equals `prettier --check .`
- AND neither invokes turbo

#### Scenario: Check passes after initial reformat

- GIVEN the tree after the initial `pnpm format` reformat has been committed
- WHEN `pnpm format:check` is run
- THEN the command exits with code 0

#### Scenario: Check fails on unformatted file

- GIVEN a non-ignored source file that violates the Prettier configuration
- WHEN `prettier --check` is run on it
- THEN the command exits with a non-zero code

### Requirement: Husky hook installation

The root `package.json` MUST define `prepare` as `husky` (husky v9), so that `pnpm install` installs the git hooks from `.husky/`. `prepare` MUST NOT fail when `.git` is absent or when `HUSKY=0` is set.

#### Scenario: Hooks are installed on install

- GIVEN a clone with `.git` present and `HUSKY` unset
- WHEN `pnpm install` is run
- THEN the `prepare` script runs `husky`
- AND git is configured to use `.husky/_` as hooks path

#### Scenario: Install without .git or with HUSKY=0

- GIVEN an environment without a `.git` directory, or with `HUSKY=0`
- WHEN `pnpm install` (or `pnpm run prepare`) is run
- THEN the command exits with code 0
- AND no hooks are installed

### Requirement: Pre-commit runs lint-staged (issue AC1)

`.husky/pre-commit` MUST run `lint-staged`. The root `package.json` MUST contain a `lint-staged` key that, for staged `js`, `mjs`, `cjs`, `ts` and `tsx` files, runs ESLint with `--fix --no-warn-ignored` first and `prettier --write` second, and, for staged `json` and `yaml`/`yml` files, runs `prettier --write`. A staged file that cannot be fixed MUST make the hook fail and thereby block the commit.

#### Scenario: Hook invokes lint-staged

- GIVEN `.husky/pre-commit`
- WHEN its content is read
- THEN it runs `lint-staged`

#### Scenario: Lint-staged configuration

- GIVEN the `lint-staged` key of the root `package.json`
- WHEN it is read
- THEN TypeScript/JavaScript globs run `eslint --fix --no-warn-ignored` before `prettier --write`
- AND JSON and YAML globs run `prettier --write`

#### Scenario: Badly formatted staged file is fixed

- GIVEN a staged, non-ignored TypeScript file that violates the Prettier configuration but has no lint errors
- WHEN the pre-commit hook runs
- THEN lint-staged rewrites the file to the Prettier-formatted output
- AND the commit proceeds with the fixed content

#### Scenario: Unfixable staged file blocks the commit

- GIVEN a staged TypeScript file containing a lint error that ESLint cannot auto-fix
- WHEN the pre-commit hook runs
- THEN lint-staged exits non-zero
- AND the commit is blocked

#### Scenario: Ignored staged path does not warn

- GIVEN a staged file that ESLint ignores (for example under `tests/lint-fixtures/`)
- WHEN the pre-commit hook runs
- THEN ESLint does not emit a file-ignored warning that fails the hook, because `--no-warn-ignored` is used

### Requirement: Commit-msg runs commitlint (issues AC2, AC3)

`.husky/commit-msg` MUST run `commitlint --edit "$1"`. A `commitlint.config.js` (ESM) at the repository root MUST extend `@commitlint/config-conventional`. Commit messages that do not follow Conventional Commits MUST be rejected (non-zero exit) and conforming messages MUST be accepted (exit 0).

#### Scenario: Hook invokes commitlint

- GIVEN `.husky/commit-msg`
- WHEN its content is read
- THEN it runs `commitlint --edit "$1"`

#### Scenario: Config extends the conventional preset

- GIVEN `commitlint.config.js`
- WHEN it is loaded
- THEN it extends `@commitlint/config-conventional`

#### Scenario: Non-conventional message is rejected

- GIVEN the message `update stuff`
- WHEN it is piped on stdin to the commitlint binary
- THEN commitlint exits with a non-zero code

#### Scenario: Conventional message is accepted

- GIVEN the message `feat(api): add x`
- WHEN it is piped on stdin to the commitlint binary
- THEN commitlint exits with code 0

### Requirement: Pre-push runs affected build and tests

`.husky/pre-push` MUST run `pnpm test:changed`. It MUST NOT run `test:workspace`.

#### Scenario: Hook content

- GIVEN `.husky/pre-push`
- WHEN its content is read
- THEN it runs `pnpm test:changed`
- AND it does not reference `test:workspace`

#### Scenario: Affected tasks are scheduled

- GIVEN the repository with a base ref available
- WHEN `turbo run build test --affected --dry=json` is run
- THEN the resolved task list contains `build` and `test` tasks only for affected packages and their dependents

### Requirement: Exact-pinned formatting and hook toolchain

The root `package.json` MUST declare `prettier`, `husky`, `lint-staged`, `@commitlint/cli` and `@commitlint/config-conventional` as devDependencies with exact versions (no range operators).

#### Scenario: Exact pins

- GIVEN the root `package.json`
- WHEN these five devDependencies are read
- THEN each is an exact version without `^` or `~`

### Requirement: Workspace tests cover configuration and behaviour

The root workspace suite (`pnpm test:workspace`, `node:test`, under `tests/workspace/`) MUST assert the configuration contract of this capability (files, scripts, hooks, pins, lint-staged config, ignore entries) and MUST include behaviour tests that spawn the real commitlint binary with a message on stdin and the real Prettier binary (`--check` and `--stdin-filepath`). The suite MUST NOT require a temporary git repository and MUST leave the git working tree clean.

#### Scenario: Behaviour tests exercise real binaries

- GIVEN the suite under `tests/workspace/`
- WHEN `pnpm test:workspace` is run
- THEN commitlint is spawned for `update stuff` (rejected) and `feat(api): add x` (accepted)
- AND Prettier is spawned to prove a badly formatted input is detected and formatted per the options

#### Scenario: Suite leaves a clean tree

- GIVEN a clean git working tree
- WHEN `pnpm test:workspace` completes
- THEN `git status --porcelain` reports no new or modified files attributable to the suite

### Requirement: Conventions documentation parity

The `## Tooling` section of `apps/docs/src/content/docs/architecture/conventions.md` MUST describe the format scripts, the three hooks, the commit message convention and how to bypass hooks in emergencies (`--no-verify`, `HUSKY=0`), and its Spanish mirror under `apps/docs/src/content/docs/es/` MUST be updated equivalently.

#### Scenario: EN/ES parity holds

- GIVEN the updated English and Spanish conventions pages
- WHEN `pnpm docs:check-i18n` is run
- THEN it exits with code 0

## Out of Scope

CI wiring of `format:check`, commitlint or `test:changed` (#20); running `test:workspace` in `pre-push`; `eslint-config-prettier`; end-to-end hook tests in a temporary git repository; formatting Markdown, MDX, OpenSpec and ODD artifacts.

## Assumptions

- Package versions are verified with `npm view` at apply and pinned exactly.
- Where no local `main` ref exists, `turbo --affected` may select all packages (safe fallback); `TURBO_SCM_BASE` can override the base and is documented.
- AC1 (lint-staged fix or block) is evidenced by the lint-staged configuration assertions plus Prettier/ESLint behaviour tests, not by an end-to-end commit in a temporary repository (out of scope per proposal).
