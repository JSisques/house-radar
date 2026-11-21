# Design: Prettier, husky, lint-staged and commitlint (S-M0-03)

Inputs: `proposal.md` (this folder; Engram `sdd/m0-prettier-husky-commitlint/proposal`), `explore.md` (this folder), `apps/docs/src/content/docs/architecture/conventions.md` (Tooling) and its `es/` mirror, root `package.json`, `turbo.json`, `eslint.config.js`, `.gitignore`, `openspec/config.yaml`, `.github/workflows/docs.yml`, and `tests/workspace/{support,config.test,turbo-cli.test,lint.test}.mjs`. The spec phase may run in parallel. This design maps to the proposal's AC1–AC3 and its success criteria.

## Technical Approach

All tooling lives at the repository root, the same way `eslint.config.js` does. Prettier is configured by one `.prettierrc`. Husky v9 is installed by the root `prepare` script and runs three plain shell hooks from `.husky/`:

- `pre-commit` runs `lint-staged`, configured under the `lint-staged` key of the root `package.json`.
- `commit-msg` runs `commitlint --edit "$1"`, configured by an ESM `commitlint.config.js` that extends `@commitlint/config-conventional`.
- `pre-push` runs `pnpm test:changed`, which is `turbo run build test --affected`.

None of these tools runs inside Turborepo, except `test:changed`, which delegates to it. `format` and `format:check` are root scripts outside turbo, like `lint:root` and `test:workspace`.

Behaviour is proven without a temporary git repository. `node:test` cases spawn the real `prettier`, `eslint`, `commitlint`, `husky` and `turbo` binaries from `node_modules/.bin` with stdin input, explicit `cwd` and explicit environment, and assert exit codes and outputs. Config-contract tests freeze the exact hook bodies and the lint-staged command order, so the behaviour tests exercise the same commands that the hooks run.

## Architecture Decisions

### Decision: Prettier options and config file

**Choice**: `.prettierrc` (JSON) with exactly `{ "singleQuote": true, "trailingComma": "all", "printWidth": 120 }`. No `overrides`, unless the jsonc fallback below is triggered.
**Alternatives considered**: `prettier.config.js` (ESM), a `prettier` key in `package.json`, the default `printWidth` of 80.
**Rationale**: The options are a binding user decision. A JSON file is static, so the config test can `readJson` it without importing code. `printWidth: 120` matches the existing ~110-character lines, which keeps the initial reformat small. Jsonc risk: if the pinned Prettier formats `tsconfig*.json` with the `jsonc` parser and adds trailing commas under `trailingComma: "all"`, add one override `{ "files": ["tsconfig*.json"], "options": { "trailingComma": "none" } }`. The test then asserts the three top-level options plus that single override. Check this at apply by inspecting the reformat diff of `tsconfig.base.json` and `packages/building-blocks/tsconfig*.json`.

### Decision: `.prettierignore` lists only additions; `.gitignore` is honoured natively

**Choice**: Prettier 3 reads `[.gitignore, .prettierignore]` by default, so `.prettierignore` contains only the extra entries:

```
pnpm-lock.yaml
openspec/
odd/
tests/lint-fixtures/
*.md
*.mdx
```

**Alternatives considered**: Copying every `.gitignore` entry into `.prettierignore`, which is what the proposal literally describes.
**Rationale**: Copying creates two lists that can drift apart. The proposal's intent, "everything gitignored plus these", is reached with one source of truth. The file-info tests below assert that both a gitignored path (`apps/docs/dist/x.js`, `.turbo/x.json`) and each extra entry are ignored. If the pinned Prettier does not read `.gitignore` by default, those tests go RED. The fallback is to copy the `.gitignore` entries, which still fits the proposal. `node_modules/` is always ignored by Prettier.

### Decision: Scripts

**Choice**:

| Script | Command | Through turbo |
| --- | --- | --- |
| `format` | `prettier --write .` | No |
| `format:check` | `prettier --check .` | No |
| `test:changed` | `turbo run build test --affected` | Yes |
| `prepare` | `husky` | No |

**Alternatives considered**: Per-workspace `format` tasks run by turbo; `test:changed` as two invocations (`build`, then `test`); `--filter=...[main]` instead of `--affected`.
**Rationale**: One root Prettier run is faster than one per workspace and needs no cache wiring. It also covers root files (`tests/`, configs) that no workspace owns. The single `turbo run build test --affected` invocation is the user's decision. `--affected` is turbo 2's supported shortcut for "changed since `TURBO_SCM_BASE` (default `main`)". `test` already `dependsOn: ["^build"]`, so dependency builds are included anyway.

### Decision: Husky v9 with plain hook bodies and bare binaries

**Choice**: `prepare: "husky"`. Each hook file contains exactly one line, without a shebang:

| File | Body |
| --- | --- |
| `.husky/pre-commit` | `lint-staged` |
| `.husky/commit-msg` | `commitlint --edit "$1"` |
| `.husky/pre-push` | `pnpm test:changed` |

**Alternatives considered**: `pnpm exec lint-staged` / `pnpm exec commitlint`; `npx`; husky v8-style files with `. "$(dirname "$0")/_/husky.sh"`.
**Rationale**: Husky v9's runner adds `node_modules/.bin` to `PATH` and runs the hook with `sh -e`, so bare binaries work and skip a pnpm start-up per commit. The v8 sourcing line is deprecated in v9. `"$1"` is quoted, so a message path with spaces still works. The hook mode does not matter, because husky's generated `.husky/_/*` wrappers are the executables, but the files are committed as `100755` for clarity. Check the `PATH` behaviour at apply from the installed `husky/husky` runner. If bare names fail, switch the bodies to `pnpm exec …` and update the frozen strings.

### Decision: lint-staged config in `package.json`, non-overlapping globs, ESLint before Prettier

**Choice**:

```json
"lint-staged": {
  "*.{js,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,jsonc,yaml,yml,css}": "prettier --write --ignore-unknown"
}
```

**Alternatives considered**: (a) A catch-all `*` glob for Prettier, which overlaps the code glob. lint-staged runs the tasks of overlapping globs concurrently on the same file, so the two writers would race. (b) An extglob negation `!(*.{js,…})`, which depends on micromatch details and is harder to read and test. (c) A separate `.lintstagedrc` or `lint-staged.config.js`.
**Rationale**: The two globs are disjoint, so no file gets two concurrent writers. Within the code glob, tasks run in array order: ESLint fixes first (import sorting can move lines), and Prettier then has the last word on layout. `--no-warn-ignored` stops ESLint from warning when a staged file is globally ignored, such as `tests/lint-fixtures/**`. Prettier silently skips explicitly passed files that `.prettierignore` or `.gitignore` covers, so fixtures stay untouched. `--ignore-unknown` on the second glob guards against files whose parser cannot be inferred. Markdown, MDX and `.astro` are not in either glob, on purpose: they are out of scope, and `.astro` would need a Prettier plugin. lint-staged v10+ re-stages modified files itself, so the config contains no `git add`.

### Decision: commitlint with the conventional preset in ESM

**Choice**: `commitlint.config.js` = `export default { extends: ['@commitlint/config-conventional'] };`. No custom rules.
**Alternatives considered**: `.commitlintrc.json`; a `commitlint` key in `package.json`; extra rules such as allowed scopes or a ban on `Co-Authored-By` trailers.
**Rationale**: The root has `"type": "module"`, so a `.js` config is ESM and matches `eslint.config.js`. The preset rejects `update stuff` (`type-empty`, `subject-empty`) and accepts `feat(api): add x`. Allowed scopes and attribution trailers are follow-ups. They are not needed for AC2 and AC3.

### Decision: Behaviour tests spawn real binaries; no temporary git repository

**Choice**: Add a `tests/workspace/formatting-hooks.test.mjs` suite and extend `support.mjs` with one generic helper:

```js
export function runBin(name, args, { input, cwd = repoRoot, env = {} } = {}) {
  const result = spawnSync(join(repoRoot, 'node_modules/.bin', name), args, {
    cwd, input, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ...env },
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}
```

`runTurbo` gains an optional `env` merged after `process.env`, so a test can pin `TURBO_SCM_BASE` regardless of the developer's shell.
**Alternatives considered**: (a) An end-to-end test that runs `git init` in a temp dir, installs the hooks and makes real commits. It is slower, depends on the git version and on global git config (signing, templates), and the proposal rejected it. (b) Asserting only the config files, which passes vacuously.
**Rationale**: Each acceptance criterion reduces to the behaviour of a binary that the hook invokes, plus a frozen hook and config contract. Spawning the binaries proves that the installed versions, flags and config files behave as intended. Freezing the hook bodies and the lint-staged arrays proves that they are the commands that run. The only unproven link is husky and lint-staged's own mechanics (git calling the hook, lint-staged re-staging files), which are their documented contracts. The apply commits made after the hooks land exercise that link for real, and a manual probe is part of verify (see Testing Strategy).

### Decision: `--affected` without a local `main`

**Choice**: Keep `turbo run build test --affected`. Do not add `TURBO_SCM_BASE` to the script. Document that `TURBO_SCM_BASE=<ref> pnpm test:changed` (for example `origin/main`) overrides the base. Prove the fallback with a dry run that pins `TURBO_SCM_BASE` to a ref that does not exist.
**Alternatives considered**: Hardcoding `TURBO_SCM_BASE=origin/main` in the script, which breaks offline clones and forks with another remote name; `--filter=...[origin/main]`.
**Rationale**: When turbo cannot resolve the base (no local `main`, shallow clone), it warns and selects every package, which is safe but slow. The user's default checkout has `main`, so the normal case is fast. The dry-run test checks the fallback deterministically: it does not depend on the working tree, because an unresolvable base means "all". The exact fallback behaviour of turbo 2.11.13 must be observed at apply. If turbo instead exits non-zero, or selects nothing, the test goes RED. In that case the script becomes a small root wrapper, `turbo run build test --affected` with `TURBO_SCM_BASE` defaulted to `origin/main` only when `main` is missing, and the user is told about the deviation.

### Decision: No `eslint-config-prettier`

**Choice**: Do not add it.
**Rationale**: `eslint.config.js` enables only `@eslint/js` recommended, `typescript-eslint` recommended, boundaries, import sorting and `no-restricted-imports`. None of these are layout rules, so there is no conflict for it to switch off. Import sorting reorders lines and Prettier never reorders them. The `eslint --fix` then `prettier --write` order makes Prettier's layout final. If a conflict appears later, add it then.

### Decision: Exact pins chosen at apply

**Choice**: Pin `prettier`, `husky`, `lint-staged`, `@commitlint/cli` and `@commitlint/config-conventional` exactly, after `npm view <pkg> version engines peerDependencies --json`. Constraints:

- `engines.node` accepts Node >= 24.
- `@commitlint/cli` and `@commitlint/config-conventional` use the same major.
- Prettier is 3.x.
- Husky is 9.x, because `prepare: husky` and the hook format are v9 semantics.

**Rationale**: This is the existing convention (`config.test.mjs` asserts `^\d+\.\d+\.\d+$`). No version claim in this design is verified, because the registry was not reachable during design. Record the selected versions and the evidence in the apply report.

## Data Flow

```
git commit ──→ .husky/_/pre-commit ──→ .husky/pre-commit: lint-staged
                                          │ staged paths, matched by glob (disjoint)
             *.{js,mjs,cjs,ts,tsx,mts,cts} ──→ eslint --fix --no-warn-ignored ──→ prettier --write
             *.{json,jsonc,yaml,yml,css}  ──→ prettier --write --ignore-unknown
                                          │ any task non-zero ──→ commit aborted
                                          ▼ fixes re-staged by lint-staged
           ──→ .husky/_/commit-msg ──→ commitlint --edit "$1" ──→ commitlint.config.js
                                                                  (config-conventional)
                                          │ non-zero ──→ commit aborted
git push   ──→ .husky/_/pre-push ──→ pnpm test:changed ──→ turbo run build test --affected
                                          │ base = TURBO_SCM_BASE ?? main; unresolved ──→ all packages
                                          ▼ non-zero ──→ push aborted

pnpm install ──→ prepare: husky ──→ git config core.hooksPath .husky/_   (no .git or HUSKY=0: no-op, exit 0)

Prettier config resolution: .prettierrc + ignore = .gitignore ∪ .prettierignore

tests/workspace/formatting-hooks.test.mjs ──→ runBin(prettier|eslint|commitlint|husky) / runTurbo(--dry=json)
                                                 stdin in, exit code + stdout out; no writes to the repo
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.prettierrc` | Create | `singleQuote`, `trailingComma: all`, `printWidth: 120` |
| `.prettierignore` | Create | Lockfile, `openspec/`, `odd/`, `tests/lint-fixtures/`, `*.md`, `*.mdx` (gitignored paths come from `.gitignore`) |
| `commitlint.config.js` | Create | ESM, extends `@commitlint/config-conventional` |
| `.husky/pre-commit` | Create | `lint-staged` |
| `.husky/commit-msg` | Create | `commitlint --edit "$1"` |
| `.husky/pre-push` | Create | `pnpm test:changed` |
| `package.json` | Modify | Scripts `format`, `format:check`, `test:changed`, `prepare`; `lint-staged` key; five exact-pinned devDependencies |
| `tests/workspace/support.mjs` | Modify | `runBin` helper; optional `env` on `runTurbo` |
| `tests/workspace/config.test.mjs` | Modify | Contracts for `.prettierrc`, `.prettierignore`, scripts, pins, hook bodies, lint-staged config, commitlint config |
| `tests/workspace/formatting-hooks.test.mjs` | Create | Behaviour tests (Prettier, ESLint flags, commitlint, husky, turbo `--affected` dry run) |
| Existing tracked sources (`tests/workspace/*.mjs`, `eslint.config.js`, `apps/docs/**/*.{ts,mjs,json}`, root JSON/YAML) | Modify | Output of `pnpm format` only, in its own `style:` commit |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modify | Tooling: Prettier options and scope, format scripts, hooks, `test:changed` and `TURBO_SCM_BASE`, bypass (`--no-verify`, `HUSKY=0`) |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modify | ES mirror, kept in parity |
| `openspec/config.yaml` | Modify (verify/archive) | `formatter: "pnpm format:check"` for `apps/docs` and `packages/building-blocks` |
| `pnpm-lock.yaml` | Modify (generated) | Excluded from the line forecast |

## Interfaces / Contracts

Frozen strings that the tests assert:

| Contract | Exact value |
| --- | --- |
| `scripts.format` | `prettier --write .` |
| `scripts['format:check']` | `prettier --check .` |
| `scripts['test:changed']` | `turbo run build test --affected` |
| `scripts.prepare` | `husky` |
| `.husky/pre-commit` (trimmed) | `lint-staged` |
| `.husky/commit-msg` (trimmed) | `commitlint --edit "$1"` |
| `.husky/pre-push` (trimmed) | `pnpm test:changed` |
| `lint-staged` | The object in the lint-staged decision (`deepEqual`) |
| `commitlint.config.js` default export | `{ extends: ['@commitlint/config-conventional'] }` (`deepEqual` after dynamic `import`) |

The `.husky/pre-push` body must not contain `test:workspace` (user decision). The existing `turbo run <task>` assertions for `build`, `dev`, `lint`, `test` and `typecheck` stay unchanged.

## Testing Strategy

Strict TDD (`openspec/config.yaml strict_tdd: true`). The runner is `pnpm test:workspace` (`node --test --test-concurrency=1 'tests/workspace/*.test.mjs'`). The behaviour suite never writes into the repository. Prettier and ESLint read stdin through `--stdin-filepath tests/workspace/__probe__.ts`. This path does not exist and is not gitignored, so config and ignore resolution match a real staged file in `tests/workspace/`. The husky checks run in `mkdtemp` directories.

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Config contract | Exact pins of the five packages; commitlint majors equal; scripts; `.prettierrc` options; `.prettierignore` contains each extra entry; hook bodies; lint-staged object; commitlint config; pre-push has no `test:workspace` | Extend `config.test.mjs`. RED: files and keys missing |
| Prettier behaviour (AC1 fix) | `const a = "x"` → `const a = 'x';\n`; a ~100-character single-line call stays on one line (proves 120, not the default 80); a multi-line array forced past 120 characters gets a trailing comma; `prettier --check --stdin-filepath` on unformatted input exits non-zero | `runBin('prettier', …)`. RED: binary missing, then config missing |
| Ignore classification | `prettier --file-info` reports `ignored: true` for `pnpm-lock.yaml`, `openspec/x.yaml`, `odd/x.json`, `tests/lint-fixtures/src/misc/sibling.ts`, `docs.md`, `page.mdx`, `apps/docs/dist/x.js`, `.turbo/x.json`; reports `ignored: false` and a parser for `eslint.config.js` and `package.json`; reports `inferredParser: null` for `requirements.txt` | `runBin('prettier', ['--file-info', path])`, JSON parsed |
| ESLint step (AC1 block) | Unfixable input (`export type Loose = any;\n`) run through `eslint --no-warn-ignored --fix-dry-run --stdin --stdin-filename tests/workspace/__probe__.ts` exits 1 with `@typescript-eslint/no-explicit-any`, so the lint-staged task fails and the commit aborts. `eslint --no-warn-ignored tests/lint-fixtures/src/misc/explicit-any.ts` exits 0 with empty output, so ignored staged files are silent | `runBin('eslint', …)` |
| commitlint (AC2, AC3) | stdin `update stuff` → non-zero, output names `type-empty` and `subject-empty`; stdin `feat(api): add x` → status 0 | `runBin('commitlint', [], { input })`, `cwd` = repo root so the ESM config is loaded |
| Husky install | `husky` in an empty `mkdtemp` dir (no `.git`) exits 0; with `HUSKY=0` it exits 0; neither creates `.husky/_` in that dir | `runBin('husky', [], { cwd: tmp, env })`. The repo's own `core.hooksPath` is never touched |
| Turbo `--affected` | `turbo run build test --affected --dry=json` with `TURBO_SCM_BASE=refs/heads/__no_such_base__` exits 0. Its tasks include `docs#build`, `docs#test`, `@house-radar/building-blocks#build` and `@house-radar/building-blocks#test`, and every task is `build` or `test` | `runTurbo(…, { cacheDir, env })` in `formatting-hooks.test.mjs`, reusing the existing `--dry=json` parse |
| Manual / verify | `pnpm format:check` exits 0. `pnpm install` installs the hooks (`git config core.hooksPath` = `.husky/_`). Hook probe: stage a badly formatted, non-ignored `tests/workspace/probe-format.ts`, run `pnpm exec lint-staged`, observe the fixed and re-staged file, then unstage and delete it. `git commit` with `update stuff` is rejected. `pnpm test:changed --dry=json` runs on a branch with local `main`. `pnpm test`, `pnpm test:workspace`, `pnpm lint`, `pnpm lint:root` and `pnpm docs:check-i18n` pass. `git status` is clean | Commands in verify, recorded in the apply report |

## Threat Matrix

The change adds git hooks (process integration with git commit and push) and tests that spawn subprocesses, so the matrix applies.

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | Applicable: lint-staged and Prettier decide which staged paths get formatted or linted | Markdown/MDX are never formatted (not in the globs, and in `.prettierignore`). Unknown types (`requirements.txt`, `CMakeLists.txt`, `README.sh`) are in neither glob, and `--ignore-unknown` skips them even under a catch-all. Nothing is executed based on file type: tools only read and rewrite. Safe behaviour: untouched. Failure behaviour: none | File-info tests: `docs.md` and `page.mdx` ignored; `requirements.txt` has `inferredParser: null`; the lint-staged globs `deepEqual` the frozen object, which has no `md`, `mdx` or `sh` |
| Git repository selection | N/A: hooks run with cwd at the worktree root, chosen by git. No command uses `git -C` or computes repository paths. Tests spawn binaries with an explicit `cwd` (repo root or `mkdtemp`) and never run git | None |
| Commit state | Applicable: `pre-commit` acts on the index | lint-staged alone owns index semantics: staged-only files, partially staged files (it stashes unstaged hunks), `commit -a`, and an empty index (no tasks, exit 0). The config never calls `git add` or touches the index itself. A failing task aborts the commit, and `--no-verify` is the documented bypass | The lint-staged config contains no `git` command. The ESLint unfixable probe exits non-zero (block path). Verify includes the manual staged probe. A temp-repo e2e is excluded by decision, which is a residual risk |
| Push state | Applicable: `pre-push` runs on every push | The hook ignores refspec, upstream and first-push state: `test:changed` compares the working tree with `TURBO_SCM_BASE` (default `main`), not with the pushed ref. Safe behaviour: an unresolvable base selects every package. Failure behaviour: a failing build or test aborts the push, and `--no-verify` or `HUSKY=0` bypasses it | The pre-push body equals `pnpm test:changed` exactly. The turbo dry run with an unresolvable `TURBO_SCM_BASE` exits 0 and selects all workspaces' `build` and `test` |
| PR commands | N/A: no PR automation is added | None |

## Migration / Rollout

Rollout: after merge, each developer's next `pnpm install` runs `prepare`, and husky sets `core.hooksPath` to `.husky/_`. CI (`docs.yml` runs `pnpm install --frozen-lockfile`) runs `husky` in its checkout too. That is harmless, because CI never commits. #20 may set `HUSKY=0` there.

Work-unit commits (Conventional Commits; strict TDD inside each, with RED observed before GREEN):

| # | Commit | Content | Forecast (authored lines) |
|---|---|---|---|
| C1 | `build: add prettier with repo config and ignore list` | `prettier` pin, `.prettierrc`, `.prettierignore`, `format` and `format:check`, `runBin`, Prettier and ignore tests | ~90 |
| C2 | `style: apply prettier formatting` | `pnpm format` output only (measure with `prettier --list-different .` first) | ~20–80 |
| C3 | `build: add commitlint with conventional preset` | Two pins, `commitlint.config.js`, commitlint contract and behaviour tests | ~45 |
| C4 | `build: add husky hooks with lint-staged and test:changed` | `husky` and `lint-staged` pins, `prepare`, `lint-staged` key, three hooks, `test:changed`, `runTurbo` env, ESLint, husky and turbo tests | ~110 |
| C5 | `docs: document formatting, git hooks and commit linting` | Tooling section EN and ES | ~35 |

Total: ~300–360 authored lines, excluding the lockfile. C5 is the first commit that passes through all three hooks, which dogfoods them.

PR slicing (auto-chain, 400-line budget): one PR when the measured total is at most 400. If the C2 reformat pushes the running count over 400, cut at the natural seam. Slice 1 is C1+C2 (Prettier and the reformat; it stands alone, because `format:check` is green). Slice 2 is C3+C4+C5 (commit hygiene, hooks and docs), stacked on slice 1.

Rollback: `git revert` the commits (C2 can be reverted on its own), then `pnpm install` to restore the lockfile. Then run `git config --unset core.hooksPath` locally, because husky v9 set it and a revert does not unset it. Until that is done, git looks for hooks in a now-missing `.husky/_`, which is a no-op. Emergency bypass without rollback: `git commit --no-verify`, `git push --no-verify`, or `HUSKY=0`.

## Open Questions

- [ ] (Verify at apply) Turbo 2.11.13 `--affected` with an unresolvable base selects all packages and exits 0. The fallback wrapper is defined above.
- [ ] (Verify at apply) Prettier 3 honours `.gitignore` by default. The fallback is to copy its entries into `.prettierignore`.
- [ ] (Verify at apply) Whether the jsonc parser adds trailing commas to `tsconfig*.json`. The fallback is the single override.
- [ ] (Verify at apply) Husky v9 puts `node_modules/.bin` on the hook `PATH`, and `husky` exits 0 without `.git`. The fallbacks are `pnpm exec …` bodies, and a `prepare` guard if the exit code is not 0.
- [ ] (Verify at apply) ESLint 10.15.0 still accepts `--no-warn-ignored` and `--fix-dry-run` with `--stdin`.
- [ ] (Non-blocking) Whether changes to root-only files (root `package.json`, `eslint.config.js`) mark any package as affected. This only affects pre-push speed and coverage. CI (#20) remains the full safety net.
