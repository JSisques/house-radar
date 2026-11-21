# Tasks: Prettier, husky, lint-staged and commitlint (S-M0-03)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated authored changed lines (excl. `pnpm-lock.yaml`) | ~300-360 (C1 ~90, C2 ~20-80, C3 ~45, C4 ~110, C5 ~35) |
| 400-line budget risk | Medium (the C2 reformat size is unknown until `prettier --list-different .` is measured) |
| Chained PRs recommended | No (single PR if the measured total is at most 400; contingency split below) |
| Suggested split | Single PR (C1-C5). Contingency if over 400: PR 1 = C1+C2, PR 2 = C3+C4+C5 stacked on PR 1 |
| Delivery strategy | auto-chain |
| Chain strategy | pending (only needed if the measured total exceeds 400; then choose stacked-to-main or feature-branch-chain; the design's contingency seam is C2/C3) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

Runner: `pnpm test:workspace` (`node --test --test-concurrency=1 'tests/workspace/*.test.mjs'`). Strict TDD: RED observed, then GREEN, then REFACTOR, per behaviour. Each commit below is one work unit. Package versions are selected at apply with `npm view` (1.1, 3.1, 4.1) and recorded in the apply report. Work-unit commits use Conventional Commits with no AI attribution. C5 is the first commit that passes through all three hooks (dogfooding).

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| C1 | Prettier pin, `.prettierrc`, `.prettierignore`, `format`/`format:check`, `runBin`, Prettier and ignore tests | PR 1 | `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs` | `pnpm exec prettier --list-different .` (measures C2) | `.prettierrc`, `.prettierignore`, `package.json` scripts and pin, `support.mjs` helper, the two test files; revert plus `pnpm install` |
| C2 | `pnpm format` output only | PR 1 | `pnpm format:check` | `pnpm format:check && pnpm lint && pnpm lint:root && pnpm test` | The `style:` commit alone (`git revert`); independent of the others |
| C3 | commitlint pins, `commitlint.config.js`, contract and behaviour tests | PR 1 (or PR 2 on split) | `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs` | `printf 'update stuff' \| pnpm exec commitlint` (non-zero) and `printf 'feat(api): add x' \| pnpm exec commitlint` (0) | `commitlint.config.js`, two pins, their test cases |
| C4 | husky and lint-staged pins, `prepare`, `lint-staged` key, three hooks, `test:changed`, `runTurbo` env, ESLint, husky and turbo tests | PR 1 (or PR 2 on split) | `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs tests/workspace/turbo-cli.test.mjs` | Manual staged probe via `pnpm exec lint-staged`; `pnpm test:changed --dry=json` | `.husky/`, hook-related scripts and pins; then `git config --unset core.hooksPath` locally |
| C5 | Tooling docs EN and ES | PR 1 (or PR 2 on split) | `pnpm docs:check-i18n` | `pnpm docs:build` | The two conventions pages |

## Phase 1: Prettier (C1) - `build: add prettier with repo config and ignore list`

- [x] 1.1 Select the Prettier version: run `npm view prettier version engines --json`; require Prettier 3.x and `engines.node` accepting Node >= 24. Record version and evidence for the apply report. (No file edit.)
- [x] 1.2 RED: extend `tests/workspace/config.test.mjs` with Prettier contract assertions: `prettier` in root `package.json` devDependencies is exact `^\d+\.\d+\.\d+$` and the major is 3; `scripts.format` equals `prettier --write .`; `scripts['format:check']` equals `prettier --check .`; neither contains `turbo`; `.prettierrc` parses with `readJson` to exactly `{ singleQuote: true, trailingComma: 'all', printWidth: 120 }` (the jsonc override is added only if 1.9 triggers it); `.prettierignore` contains each of `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/`, `*.md`, `*.mdx`. Observe failures. (spec: workspace-formatting-and-hooks "Prettier configuration", "Prettier ignore list", "Format scripts", "Exact-pinned formatting and hook toolchain"; workspace-task-pipeline "Non-turbo root scripts run directly")
- [x] 1.3 RED: add the generic `runBin(name, args, { input, cwd, env })` helper to `tests/workspace/support.mjs` (spawns `node_modules/.bin/<name>`, utf8, 120 s timeout, 32 MiB buffer, env merged over `process.env`). Create `tests/workspace/formatting-hooks.test.mjs` with Prettier behaviour cases using `--stdin-filepath tests/workspace/__probe__.ts`: `const a = "x"` becomes `const a = 'x';\n`; a ~100-character single-line call stays on one line (proves 120, not the default 80); a multi-line array forced past 120 characters ends with a trailing comma; `prettier --check --stdin-filepath` on unformatted input exits non-zero. Observe failures (binary missing). (spec: "Options take effect", "Check fails on unformatted file", "Behaviour tests exercise real binaries")
- [x] 1.4 RED: add `prettier --file-info` cases to `tests/workspace/formatting-hooks.test.mjs` (JSON parsed): `ignored: true` for `pnpm-lock.yaml`, `openspec/x.yaml`, `odd/x.json`, `tests/lint-fixtures/src/misc/sibling.ts`, `apps/docs/design/x.html`, `docs.md`, `page.mdx`, `apps/docs/dist/x.js`, `.turbo/x.json`; `ignored: false` with a non-null `inferredParser` for `eslint.config.js` and `package.json`; `inferredParser: null` for `requirements.txt`. Observe failures. (spec: "Ignored file is left untouched"; threat matrix "Documentation-like paths")
- [x] 1.5 GREEN: edit `package.json` adding the exact-pinned `prettier` devDependency, `"format": "prettier --write ."` and `"format:check": "prettier --check ."`; run `pnpm install` to refresh `pnpm-lock.yaml`.
- [x] 1.6 GREEN: create `.prettierrc` with exactly `{ "singleQuote": true, "trailingComma": "all", "printWidth": 120 }`.
- [x] 1.7 GREEN: create `.prettierignore` with only the additions (`pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/`, `*.md`, `*.mdx`); `.gitignore` (read-only) is honoured natively by Prettier 3.
- [x] 1.8 Verify at apply (Prettier reads `.gitignore`): confirm 1.4 passes for `apps/docs/dist/x.js` and `.turbo/x.json`. Fallback if RED: copy the `.gitignore` (read-only) entries into `.prettierignore` and note the deviation (still within the proposal).
- [x] 1.9 Verify at apply (jsonc trailing commas): run `pnpm exec prettier --check tsconfig.base.json packages/building-blocks/tsconfig.json` or inspect the diff when formatting. If Prettier adds trailing commas to `tsconfig*.json`, add the single override `{ "files": ["tsconfig*.json"], "options": { "trailingComma": "none" } }` to `.prettierrc` and update the 1.2 assertion to expect the three options plus that override.
- [x] 1.10 GREEN check: run `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs`; all pass.
- [x] 1.11 REFACTOR: dedupe probe/stdin helpers in `tests/workspace/formatting-hooks.test.mjs`; keep `tests/workspace/support.mjs` limited to `runBin`.
- [x] 1.12 Commit C1 `build: add prettier with repo config and ignore list`. Measure the C2 reformat size with `pnpm exec prettier --list-different .` and record the file and line forecast (decides the single-PR vs split path).

## Phase 2: Initial reformat (C2) - `style: apply prettier formatting`

- [x] 2.1 Run `pnpm format` (output only; no hand edits). Review the diff for `tsconfig*.json` (see 1.9) and confirm no ignored path (`openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/`, `*.md`, `*.mdx`, `pnpm-lock.yaml`) changed. Expected touched files: `tests/workspace/*.mjs`, `eslint.config.js`, `apps/docs/**/*.{ts,mjs,json}`, root JSON/YAML.
- [x] 2.2 GREEN check: `pnpm format:check` exits 0 (spec "Check passes after initial reformat"); `pnpm lint`, `pnpm lint:root`, `pnpm typecheck`, `pnpm test` and `pnpm test:workspace` exit 0 (formatting must not break ESLint import sorting or the lint fixture tests).
- [x] 2.3 Commit C2 `style: apply prettier formatting`. Re-measure the running authored-line count; if it exceeds 400, stop here and open PR 1 = C1+C2, then stack C3-C5 as PR 2 (ask for the chain strategy only in that case; auto-chain).

## Phase 3: commitlint (C3) - `build: add commitlint with conventional preset`

- [ ] 3.1 Select versions: run `npm view @commitlint/cli version engines peerDependencies --json` and the same for `@commitlint/config-conventional`; require the same major for both and `engines.node` accepting Node >= 24. Record evidence. (No file edit.)
- [ ] 3.2 RED: extend `tests/workspace/config.test.mjs`: `@commitlint/cli` and `@commitlint/config-conventional` are exact `^\d+\.\d+\.\d+$` with equal major; `commitlint.config.js` default export, loaded by dynamic `import`, `deepEqual`s `{ extends: ['@commitlint/config-conventional'] }`. Observe failures. (spec: "Config extends the conventional preset", "Exact pins")
- [ ] 3.3 RED: add commitlint behaviour cases to `tests/workspace/formatting-hooks.test.mjs` using `runBin('commitlint', [], { input })` with `cwd` = repo root: `update stuff` exits non-zero and the output names `type-empty` and `subject-empty` (AC2); `feat(api): add x` exits 0 (AC3). Observe failures (binary missing). (spec: "Non-conventional message is rejected", "Conventional message is accepted")
- [ ] 3.4 GREEN: edit `package.json` adding the two exact-pinned devDependencies; run `pnpm install`.
- [ ] 3.5 GREEN: create `commitlint.config.js` with `export default { extends: ['@commitlint/config-conventional'] };` (ESM; the root has `"type": "module"`). No custom rules.
- [ ] 3.6 GREEN check: run `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs`; run `pnpm format:check` and `pnpm lint:root` (new files must be formatted and lint-clean).
- [ ] 3.7 REFACTOR: tidy shared config-test helpers.
- [ ] 3.8 Commit C3 `build: add commitlint with conventional preset`.

## Phase 4: husky, lint-staged and test:changed (C4) - `build: add husky hooks with lint-staged and test:changed`

- [ ] 4.1 Select versions: run `npm view husky version engines --json` and `npm view lint-staged version engines --json`; require husky 9.x and `engines.node` accepting Node >= 24 for both. Record evidence. (No file edit.)
- [ ] 4.2 RED: extend `tests/workspace/config.test.mjs`: `husky` (major 9) and `lint-staged` are exact `^\d+\.\d+\.\d+$`; `scripts.prepare` equals `husky`; `scripts['test:changed']` equals `turbo run build test --affected`; `prepare` does not contain `turbo`; the `lint-staged` key `deepEqual`s `{ "*.{js,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix --no-warn-ignored", "prettier --write"], "*.{json,jsonc,yaml,yml,css}": "prettier --write --ignore-unknown" }` and contains no `git` command and no `md`, `mdx` or `sh` glob; `.husky/pre-commit` trimmed equals `lint-staged`; `.husky/commit-msg` trimmed equals `commitlint --edit "$1"`; `.husky/pre-push` trimmed equals `pnpm test:changed` and does not contain `test:workspace`. Keep existing `turbo run <task>` assertions for `build`, `dev`, `lint`, `test`, `typecheck` unchanged. Observe failures. (spec: "Hook invokes lint-staged", "Lint-staged configuration", "Hook invokes commitlint", "Hook content", "Script definitions"; workspace-task-pipeline "test:changed runs affected build and test", "Exact pins")
- [ ] 4.3 RED: add an optional `env` parameter to `runTurbo` in `tests/workspace/support.mjs` (merged after `process.env`) and add the turbo `--affected` case to `tests/workspace/formatting-hooks.test.mjs`: `turbo run build test --affected --dry=json` with `TURBO_SCM_BASE=refs/heads/__no_such_base__` (and an isolated cache dir, reusing the existing `--dry=json` parse) exits 0; tasks include `docs#build`, `docs#test`, `@house-radar/building-blocks#build` and `@house-radar/building-blocks#test`; every task is `build` or `test`. Observe the result against turbo 2.11.13. (spec: "Affected tasks are scheduled"; threat matrix "Push state")
- [ ] 4.4 RED: add ESLint step cases to `tests/workspace/formatting-hooks.test.mjs` using `runBin('eslint', …)`: `export type Loose = any;\n` through `eslint --no-warn-ignored --fix-dry-run --stdin --stdin-filename tests/workspace/__probe__.ts` exits 1 with `@typescript-eslint/no-explicit-any` in the output (AC1 block path); `eslint --no-warn-ignored tests/lint-fixtures/src/misc/explicit-any.ts` exits 0 with empty output. Observe failures or flag errors. (spec: "Unfixable staged file blocks the commit", "Ignored staged path does not warn"; threat matrix "Commit state")
- [ ] 4.5 RED: add husky cases to `tests/workspace/formatting-hooks.test.mjs`: `runBin('husky', [], { cwd: <mkdtemp dir without .git> })` exits 0; the same with `env: { HUSKY: '0' }` exits 0; neither creates `.husky/_` in that dir. The repository's own `core.hooksPath` is never touched and git is never run. Observe failures (binary missing). (spec: "Install without .git or with HUSKY=0")
- [ ] 4.6 GREEN: edit `package.json` adding the exact-pinned `husky` and `lint-staged` devDependencies, `"prepare": "husky"`, `"test:changed": "turbo run build test --affected"` and the `lint-staged` key exactly as frozen in 4.2; run `pnpm install` (this runs `prepare` and sets `core.hooksPath` to `.husky/_` locally).
- [ ] 4.7 GREEN: create `.husky/pre-commit` (`lint-staged`), `.husky/commit-msg` (`commitlint --edit "$1"`) and `.husky/pre-push` (`pnpm test:changed`): one line each, no shebang, committed as mode 100755.
- [ ] 4.8 Verify at apply (husky PATH): read the installed `node_modules/husky` runner (read-only) to confirm it adds `node_modules/.bin` to `PATH` and runs hooks with `sh -e`. Fallback if bare names fail: change the hook bodies to `pnpm exec lint-staged` and `pnpm exec commitlint --edit "$1"`, update the frozen strings in 4.2, and disclose.
- [ ] 4.9 Verify at apply (husky without `.git` / `HUSKY=0`): if 4.5 shows a non-zero exit, guard `prepare` (for example `husky || true`-style wrapper) and update the frozen `prepare` string and spec note; otherwise no change.
- [ ] 4.10 Verify at apply (ESLint 10 flags): confirm `--no-warn-ignored` and `--fix-dry-run` with `--stdin` are still accepted by the pinned ESLint (4.4 passing proves it). If a flag was removed, adjust the lint-staged command in 4.2/4.6 and disclose.
- [ ] 4.11 Verify at apply (turbo `--affected` without local `main`): if 4.3 shows turbo exiting non-zero or selecting nothing, replace the script with a small root wrapper defaulting `TURBO_SCM_BASE` to `origin/main` only when `main` is missing, update the frozen `test:changed` string, and tell the user about the deviation. Otherwise keep the script unchanged and document `TURBO_SCM_BASE=<ref> pnpm test:changed` in C5.
- [ ] 4.12 GREEN check: run `node --test tests/workspace/config.test.mjs tests/workspace/formatting-hooks.test.mjs tests/workspace/turbo-cli.test.mjs`; run `pnpm format:check`, `pnpm lint`, `pnpm lint:root`.
- [ ] 4.13 Manual probe (record in the apply report): stage a badly formatted, non-ignored `tests/workspace/probe-format.ts`, run `pnpm exec lint-staged`, observe it fixed and re-staged, then unstage and delete it; stage a lint-unfixable file and observe non-zero; confirm `git config core.hooksPath` is `.husky/_`; run `pnpm test:changed --dry=json` on this branch (local `main` exists).
- [ ] 4.14 REFACTOR: dedupe env and spawn helpers in `tests/workspace/formatting-hooks.test.mjs`.
- [ ] 4.15 Commit C4 `build: add husky hooks with lint-staged and test:changed`. Hooks now run on this commit (lint-staged, commitlint).

## Phase 5: Documentation (C5) - `docs: document formatting, git hooks and commit linting`

- [ ] 5.1 Edit the `## Tooling` section of `apps/docs/src/content/docs/architecture/conventions.md`: Prettier options and scope (including that Markdown, MDX, OpenSpec and ODD are not formatted), `format` and `format:check`, the three hooks and what each runs, the lint-staged order (ESLint then Prettier), the Conventional Commits convention enforced by commitlint, `test:changed` with `TURBO_SCM_BASE=<ref>` override and the all-packages fallback, and emergency bypass (`--no-verify`, `HUSKY=0`).
- [ ] 5.2 Edit `apps/docs/src/content/docs/es/architecture/conventions.md` with the equivalent Spanish content (neutral register), keeping heading and section parity.
- [ ] 5.3 GREEN checks: `pnpm docs:check-i18n` and `pnpm docs:build` exit 0.
- [ ] 5.4 Commit C5 `docs: document formatting, git hooks and commit linting` (first commit through all three hooks; dogfoods lint-staged and commitlint).

## Phase 6: Final verification

- [ ] 6.1 Run `pnpm format:check`, `pnpm lint`, `pnpm lint:root`, `pnpm typecheck`, `pnpm test`, `pnpm test:workspace`, `pnpm docs:check-i18n`, `pnpm docs:build`; all exit 0 and `git status --porcelain` is clean (the suite writes nothing; spec "Suite leaves a clean tree").
- [ ] 6.2 Edit `openspec/config.yaml` to add `formatter: "pnpm format:check"` for `apps/docs` and `packages/building-blocks`, if the file has a matching section (verify/archive step, same as the previous change).
- [ ] 6.3 Record in the apply report: selected versions with `npm view` evidence, every verify-at-apply outcome and fallback taken (turbo `--affected`, Prettier `.gitignore`, jsonc, husky PATH and no-`.git`, ESLint flags), RED/GREEN evidence per commit, the measured line count per commit, and the single-PR or split decision.

## PR Slice Boundaries

- Default: one PR holding C1-C5 (base: main; ~300-360 authored lines excluding the lockfile).
- Contingency (running count over 400 after C2): PR 1 = C1+C2 (Prettier and the reformat; stands alone because `format:check` is green), PR 2 = C3+C4+C5 (commit hygiene, hooks and docs) stacked on PR 1. The chain strategy (`stacked-to-main` or `feature-branch-chain`) is chosen only then; delivery strategy is auto-chain, so apply proceeds with the first slice once chosen.
- Rollback: `git revert` the commits (C2 can be reverted alone), `pnpm install`, then `git config --unset core.hooksPath` locally. Emergency bypass: `git commit --no-verify`, `git push --no-verify`, or `HUSKY=0`.
