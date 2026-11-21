# Proposal: Prettier, husky, lint-staged and commitlint (S-M0-03)

Source: GitHub issue #18 (S-M0-03, parent #3, depends on #17 / S-M0-02, archived as `m0-eslint-flat-config`). Exploration: `openspec/changes/m0-prettier-husky-commitlint/explore.md` (mirror of Engram `sdd/m0-prettier-husky-commitlint/explore`). References: `apps/docs/src/content/docs/architecture/conventions.md` (Tooling), decision D16.

## Intent

AGENTS.md and the conventions require Conventional Commits and a consistent code style, but nothing enforces either locally: there is no formatter, no git hooks, and commit messages are unchecked. Problems are only found in review, or later in CI (#20). This change enforces formatting and commit hygiene on the developer machine, before code leaves it, so CI becomes a second safety net instead of the first line of defence.

Success means: committing a badly formatted staged file gets it fixed by lint-staged or blocks the commit; the message `update stuff` is rejected and `feat(api): add x` is accepted; pushing runs build and tests for the affected packages.

## Scope

### In Scope
- `.prettierrc` with `singleQuote: true`, `trailingComma: "all"`, `printWidth: 120` (user decision).
- `.prettierignore` mirroring `.gitignore` plus `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `*.md` and `*.mdx`.
- Root scripts:
  - `format` = `prettier --write .`
  - `format:check` = `prettier --check .` (repo-wide, honoring `.prettierignore`)
  - `test:changed` = `turbo run build test --affected` (user decision: one turbo invocation, build and tests of affected packages)
  - `prepare` = `husky` (husky v9; tolerant of a missing `.git` and of `HUSKY=0`)
- Husky hooks under `.husky/`:
  - `pre-commit`: `lint-staged` (ESLint `--fix --no-warn-ignored`, then `prettier --write` on staged files).
  - `commit-msg`: `commitlint --edit "$1"` with `@commitlint/config-conventional`.
  - `pre-push`: `pnpm test:changed` (user decision).
- `lint-staged` configuration under the `lint-staged` key of the root `package.json`.
- `commitlint.config.js` (ESM) extending `@commitlint/config-conventional`.
- Exact-pinned root devDependencies: `prettier`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` (versions verified with `npm view` at apply).
- Workspace tests in `tests/workspace/*.test.mjs` (`node:test`): config assertions (files, scripts, hooks, pins, lint-staged config, ignore entries) and behaviour tests that spawn commitlint (message on stdin) and Prettier (`--check` / `--stdin-filepath`) directly.
- Any initial reformat produced by `pnpm format` lands as its own commit.
- Docs: update the Tooling section of `conventions.md` (EN) and its `es/` mirror, keeping `pnpm docs:check-i18n` green.

### Out of Scope
- CI wiring of `format:check`, commitlint or `test:changed` (#20).
- Running `test:workspace` in `pre-push` (user decision: left for CI, #20).
- `eslint-config-prettier` (ESLint config has no stylistic rules today).
- End-to-end hook tests in a temporary git repository.
- Formatting Markdown/MDX, OpenSpec and ODD artifacts.

## Capabilities

### New Capabilities
- `workspace-formatting-and-hooks`: Prettier configuration and ignore contract, `format`/`format:check` scripts, husky hook installation (`prepare`), pre-commit lint-staged (ESLint fix + Prettier on staged files), commit-msg commitlint with the conventional preset, pre-push `test:changed`, exact-pinned tooling, behaviour tests, and conventions documentation parity.

### Modified Capabilities
- `workspace-task-pipeline`: "Root scripts delegate to Turborepo" gains `test:changed` (delegates to `turbo run build test --affected`) and acknowledges the non-turbo root scripts `format`, `format:check` and `prepare`; "Pinned toolchain" gains the Prettier, husky, lint-staged and commitlint packages as exact pins.

## Approach

1. Strict TDD: write the `node:test` assertions and behaviour tests first (RED: config files and binaries missing), then add dependencies, config files, hooks and scripts until green.
2. Prettier at the root with one `.prettierrc`; `.prettierignore` keeps docs-like and generated content out so the existing compact Markdown tables and fixtures are untouched. `printWidth: 120` matches current code (lines up to ~110), keeping the initial reformat small.
3. Husky v9 via `prepare: husky`; hook files are plain shell without shebang. `prepare` must not fail when `.git` is absent or `HUSKY=0` is set (installs in CI/containers).
4. lint-staged runs ESLint first (`--fix --no-warn-ignored`, so ignored paths like fixtures do not warn) and Prettier second, on staged `js/mjs/cjs/ts/tsx/json/yaml` files as appropriate.
5. commitlint with `@commitlint/config-conventional`; tests pipe messages on stdin to the commitlint binary and assert exit codes for `update stuff` (reject) and `feat(api): add x` (accept).
6. `test:changed` uses turbo `--affected`; behaviour without a local `main` ref is verified at apply with `--dry=json` and, if needed, documented (`TURBO_SCM_BASE`).
7. Docs EN/ES update describing format scripts, hooks and how to bypass in emergencies (`--no-verify`, `HUSKY=0`).

Rationale: root-level, single-source configuration matches the existing ESLint setup; testing through the real binaries without a temporary git repository is fast and deterministic while still proving each acceptance criterion; keeping `test:workspace` and CI wiring out of the hooks keeps `pre-push` fast.

## Resolved Decisions

- User-confirmed (binding): Prettier options `singleQuote: true`, `trailingComma: "all"`, `printWidth: 120`; `pre-push` runs `test:changed` = `turbo run build test --affected`; `test:workspace` is not run in `pre-push`.
- Orchestrator defaults (reversible): no `eslint-config-prettier`; no end-to-end temp-repo hook test; `.prettierignore` contents as listed; `format:check` repo-wide; initial reformat as its own commit (separate PR only if it would push the slice over 400 lines); exact pins; lint-staged config in `package.json`; `commitlint.config.js` in ESM.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.prettierrc` | New | Prettier options |
| `.prettierignore` | New | Ignore list |
| `commitlint.config.js` | New | Conventional preset (ESM) |
| `.husky/pre-commit` | New | `lint-staged` |
| `.husky/commit-msg` | New | `commitlint --edit "$1"` |
| `.husky/pre-push` | New | `pnpm test:changed` |
| `package.json` | Modified | Scripts `format`, `format:check`, `test:changed`, `prepare`; `lint-staged` key; exact-pinned devDeps |
| `tests/workspace/config.test.mjs` | Modified | New config assertions |
| `tests/workspace/formatting-hooks.test.mjs` | New | commitlint and Prettier behaviour tests |
| Existing source files | Modified (possible) | Initial `pnpm format` reformat, separate commit |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modified | Tooling section |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modified | ES mirror |
| `openspec/config.yaml` | Modified (at verify/archive) | `formatter: "pnpm format:check"` per project |
| `pnpm-lock.yaml` | Modified (generated) | Excluded from forecast |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `turbo --affected` without a local `main` ref (fresh or single-branch clone) selects nothing or everything, making `pre-push` useless or slow | Med | Verify at apply with `turbo run build test --affected --dry=json`; document `TURBO_SCM_BASE` override; accept "all packages" as safe fallback |
| Initial reformat is larger than expected and blows the 400-line budget | Med | Measure with `pnpm format:check` at apply; reformat in its own commit, split into its own PR under auto-chain if needed |
| `prepare: husky` breaks installs where `.git` is missing (Docker, CI) | Low | Husky v9 exits cleanly without `.git`; `HUSKY=0` supported; assert in tests/docs |
| ESLint and Prettier disagree on formatting | Low | ESLint config has no stylistic rules; add `eslint-config-prettier` later if a conflict appears |
| Package versions unverified (no registry access during explore) | Med | `npm view` at apply; pin exact versions |
| Hook tests pass vacuously (testing config, not behaviour) | Low | Behaviour tests spawn the real commitlint and Prettier binaries and assert exit codes |

## Rollback Plan

Additive tooling. Revert the work-unit commit(s) with `git revert`, run `pnpm install` to restore the lockfile, and run `git config --unset core.hooksPath` (husky v9 sets it) to disable hooks locally. The reformat commit, if any, can be reverted independently. No runtime code, build or docs output depends on these tools.

## Dependencies

- #17 / S-M0-02 (ESLint flat config, `lint:root`), archived.
- npm registry access at apply to verify and install exact versions.
- Node >= 24, pnpm 10.34.6, turbo 2.11.13.

## Success Criteria

- [ ] AC1: Staging a badly formatted file and committing makes lint-staged fix it (or block the commit when it cannot be fixed).
- [ ] AC2: The commit message `update stuff` is rejected by commitlint.
- [ ] AC3: The commit message `feat(api): add x` is accepted by commitlint.
- [ ] `pnpm format:check` exits 0 on the tree after the initial reformat; ignored paths are untouched.
- [ ] `pnpm test:changed` runs build and test for affected packages (verified with `--dry=json`).
- [ ] `pnpm install` installs the hooks; it does not fail without `.git` or with `HUSKY=0`.
- [ ] `pnpm test`, `pnpm test:workspace`, `pnpm lint` and `pnpm lint:root` pass and leave a clean tree.
- [ ] Conventions Tooling section updated in EN and ES; `pnpm docs:check-i18n` passes.
- [ ] Authored diff forecast ~250–350 lines excluding lockfile and reformat (config/hooks ~40, package.json ~25, tests ~150, docs EN+ES ~50). Budget risk Low–Medium: under auto-chain, the reformat becomes its own PR if it pushes the slice over 400 lines.
