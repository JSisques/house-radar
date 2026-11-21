# Tasks: ESLint flat config with boundaries and import sorting (S-M0-02)

Revision 2: re-sliced so each PR ships its behaviour together with its tests (user-approved). IDs 1.x to 3.x stay in PR 1. Former alias, turbo dry-run, docs and final-verification tasks are now 4.x to 7.x in PR 2 (formerly 4.x to 6.x).

## Review Workload Forecast

| Field | PR 1 | PR 2 | Total |
|-------|------|------|-------|
| Estimated authored changed lines (excl. `pnpm-lock.yaml`) | ~300-360 | ~200-240 | ~500-600 |
| 400-line budget risk | Medium (close to budget) | Low | High overall |
| Contents | pins, `eslint.config.js`, scripts, turbo inputs, config assertions, relative-path fixtures and `lint.test.mjs`, docs one-off `--fix` | `${configDir}` aliases, resolver project list, alias fixtures and tests, turbo dry-run test, docs EN+ES, `openspec/config.yaml` | |

| Field | Value |
|-------|-------|
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |
| Suggested split | PR 1 (tooling, config and tests for its rules) -> PR 2 (aliases, turbo dry-run, docs) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Honest note on PR 1: the estimate of ~300-360 lines is near the 400 budget and could exceed it if `eslint.config.js` or `lint.test.mjs` grow. If the measured PR 1 diff exceeds 400, use this smallest split that keeps tests with behaviour: move the `simple-import-sort` rules (config block and groups), `misc/unsorted-imports.ts`, `misc/sibling.ts` and the import-sort cases of `lint.test.mjs` (tasks 2.3c, 3.1 unsorted fixture, 3.3) into a new PR between 1 and 2 ("PR 1b"). Nothing else moves, so every PR still carries its own tests. Stacked-to-main: each PR merges to main in order.

Runner: `pnpm test:workspace` (node:test). Strict TDD: RED, then GREEN, then REFACTOR per behaviour. Package versions are selected at apply with `npm view` (1.1) and recorded in the apply report.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Pinned toolchain, lint scripts, `lint:root`, turbo `lint` inputs, config assertions | PR 1 | `node --test tests/workspace/config.test.mjs` | `pnpm install && pnpm typecheck` | `package.json`, `turbo.json`, workspace `package.json` files, config assertions; revert plus `pnpm install` |
| 2 | `eslint.config.js` rules (boundaries, `../`, import sort without alias group, `any`) with relative fixtures and behaviour test | PR 1 | `node --test tests/workspace/lint.test.mjs` | `pnpm lint && pnpm lint:root && pnpm test:workspace && git status --porcelain` | `eslint.config.js`, `tests/lint-fixtures/**`, `tests/workspace/lint.test.mjs`, docs one-off fixes |
| 3 | Base `${configDir}` aliases, resolver project list, alias fixtures, alias sort group | PR 2 | `node --test tests/workspace/lint.test.mjs tests/workspace/config.test.mjs` | `pnpm typecheck && pnpm lint` | `tsconfig.base.json`, resolver block and alias group in `eslint.config.js`, alias fixtures and cases |
| 4 | Turbo dry-run lint-input check | PR 2 | `node --test tests/workspace/turbo-cli.test.mjs` | `pnpm turbo run lint --dry=json` | the added test case |
| 5 | Conventions docs EN and ES, `openspec/config.yaml` | PR 2 | `pnpm docs:check-i18n` | `pnpm docs:build` | the two conventions pages, `openspec/config.yaml` |

# PR 1: tooling, config and rule tests (base: main)

## Phase 1: Toolchain, scripts, turbo (PR 1)

Commit 1: `build: pin eslint toolchain and add lint scripts and turbo lint inputs`

- [x] 1.1 Select versions: run `npm view <pkg> version peerDependencies engines --json` for `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort`, `eslint-import-resolver-typescript`, `globals`. Apply design constraints 1-6 (highest ESLint major accepted by all peers, Node >= 24, TypeScript 5.9.3 peer). Record versions, evidence, boundaries rule id and template syntax in the apply report. (No file edit.)
- [x] 1.2 RED: extend `tests/workspace/config.test.mjs` with assertions: the 7 lint devDependencies in root `package.json` are exact `^\d+\.\d+\.\d+$` and `eslint` equals `@eslint/js`; root `lint:root` equals `eslint tests eslint.config.js` and does not contain `turbo`; `turbo.json` `tasks.lint.inputs` includes `$TURBO_DEFAULT$` and `$TURBO_ROOT$/eslint.config.js`; `lint` is `eslint .` in `packages/building-blocks/package.json` and `apps/docs/package.json`. Update the existing `deepEqual` on building-blocks scripts and the docs characterization test to include `lint`. Observe failures. (spec: workspace-linting "Exact-pinned lint toolchain", "Per-workspace lint scripts", "Root files linted outside turbo", "Lint cache invalidates"; workspace-task-pipeline "Pinned toolchain", "Root scripts delegate")
- [x] 1.3 GREEN: edit `package.json` with the 7 exact-pinned devDependencies and `"lint:root": "eslint tests eslint.config.js"`; run `pnpm install` to refresh `pnpm-lock.yaml`.
- [x] 1.5 GREEN: edit `turbo.json` setting `tasks.lint` to `{ "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/eslint.config.js"], "outputs": [] }` (no `dependsOn`).
- [x] 1.6 GREEN: edit `packages/building-blocks/package.json` and `apps/docs/package.json` adding `"lint": "eslint ."`. Confirm the root `eslint` binary is reachable from workspaces; if not, add the same exact pin to each workspace devDependencies.
- [x] 1.7 GREEN check: run `node --test tests/workspace/config.test.mjs`; all assertions pass. Update existing characterization assertions that hard-code script sets.
- [x] 1.8 REFACTOR: dedupe assertion helpers in `tests/workspace/config.test.mjs`; keep `tests/workspace/support.mjs` unchanged unless needed.

(1.4, the base `paths` task, moved to 4.1 in PR 2.)

## Phase 2: Fixtures, behaviour tests and shared config (PR 1)

Commit 2: `test(lint): add relative-path fixtures and eslint behaviour tests`
Commit 3: `feat(lint): add shared eslint flat config with boundaries and import sorting`

Strict TDD order: commit 2 is authored and its failures observed (RED) against a stub config before commit 3 makes them GREEN. Commit 2 on its own is red, so squash or order them so no intermediate merge state breaks `pnpm test:workspace`: either keep both in one PR commit sequence verified at the PR head, or land the stub-config in commit 2 (2.1) so the suite fails only on the rule assertions marked as expected RED in the apply report. The PR head must be fully green.

Relative-import fixtures: boundaries is exercised in PR 1 through relative paths and the default resolution of the pinned `eslint-import-resolver-typescript` (no `project` list, no aliases). Cross-layer relative imports necessarily use `../`, so those fixtures report BOTH the boundaries rule id and `no-restricted-imports`. Tests assert the exact sorted id list, so this is deliberate, not collateral noise. Same-directory and `../`-only cases are isolated by their own fixtures.

- [x] 2.1 Stub (RED baseline): create `eslint.config.js` with only the ignores object (`**/dist/**`, `**/.astro/**`, `**/.turbo/**`, `**/coverage/**`, `tests/lint-fixtures/**`), `@eslint/js` recommended and `tseslint.configs.recommended` for TS files, Node globals for JS and MJS. No custom rules yet.
- [x] 2.2 Create fixtures under `tests/lint-fixtures/src/` (no `tsconfig.json` in PR 1), each re-exporting what it imports so only the intended rule fires:
  - `contexts/listings/domain/listing.ts` (clean target), `same-dir-relative.ts` (`./listing`), `imports-infrastructure.ts` (`../infrastructure/listing-store`)
  - `contexts/listings/application/uses-domain.ts` (`../domain/listing`), `imports-other-context.ts` (`../../../pricing/application/price-quote`)
  - `contexts/listings/infrastructure/listing-store.ts` (clean target), `uses-domain.ts` (`../domain/listing`, inward allowed), `adapters/pricing.adapter.ts` (`../../../pricing/application/price-quote`, cross-context from adapters)
  - `contexts/pricing/application/price-quote.ts` (clean target)
  - `misc/plain-value.ts`, `misc/sibling.ts` (clean targets), `misc/nested/parent-relative.ts` (`../plain-value`), `misc/explicit-any.ts` (`export type Loose = any;`), `misc/unsorted-imports.ts` (shuffled `./sibling`, `@house-radar/building-blocks/package-marker`, a bare external specifier, `node:fs`; no alias import)
- [x] 2.3 RED: create `tests/workspace/lint.test.mjs` using `new ESLint({ cwd: repoRoot, ignore: false })`. Constant `BOUNDARIES_RULE` holds the rule id from 1.1. Assert exact sorted `ruleId` lists:
  - `domain/imports-infrastructure.ts` -> sorted `[BOUNDARIES_RULE, 'no-restricted-imports']` (AC1)
  - `application/imports-other-context.ts` -> sorted `[BOUNDARIES_RULE, 'no-restricted-imports']` (context isolation)
  - `domain/same-dir-relative.ts` -> `[]` (same-dir allowed)
  - `application/uses-domain.ts`, `infrastructure/uses-domain.ts`, `infrastructure/adapters/pricing.adapter.ts` -> `['no-restricted-imports']` only; assert no id starts with `boundaries/` (inward and adapter cross-context allowed)
  - `misc/nested/parent-relative.ts` -> `['no-restricted-imports']` (AC2)
  - `misc/explicit-any.ts` -> `['@typescript-eslint/no-explicit-any']` (AC4)
  - `misc/unsorted-imports.ts` (no fix) -> `['simple-import-sort/imports']` (AC3)
  - fix instance `fix: (m) => m.ruleId?.startsWith('simple-import-sort/')`: `result.output === EXPECTED_SORTED` (built-ins, external, `@house-radar/*`, relative) and on-disk bytes unchanged (read before and after; never call `outputFixes`)
  - guard: default instance (`ignore` on) reports `isPathIgnored(fixture) === true`
  Observe each rule assertion failing against the stub (2.1).
- [x] 2.3a GREEN (rules): in `eslint.config.js` add `@typescript-eslint/no-explicit-any: error`; `no-restricted-imports` with `patterns: [{ regex: '^\\.\\.(/|$)', message }]` (message may mention aliases, which land in PR 2; fall back to `group` if the pinned ESLint lacks `regex`).
- [x] 2.3b GREEN (boundaries): add boundaries `elements` (adapter first, then domain, application, infrastructure, transport, core, shared, mode `folder`, `context` capture), the dependency table with `default: 'disallow'`, rule id and template syntax from 1.1, and `settings['import/resolver'].typescript = { alwaysTryTypes: true }` (no `project`; if `.ts` relative targets do not resolve, add a node resolver with `extensions` as the minimal fallback and disclose). The non-vacuous check is the exact boundaries id on the relative cross-layer fixtures.
- [x] 2.3c GREEN (import sort): add `simple-import-sort/imports` with groups side-effect, Node built-ins (`node:module` `builtinModules`), external, `@house-radar` workspace, relative; plus `simple-import-sort/exports`. The alias group is NOT added here; it lands in 4.4 with its test.
- [x] 2.4 GREEN: run `node --test tests/workspace/lint.test.mjs`, then `pnpm lint:root` and `pnpm lint`. For existing import-order violations in `apps/docs/astro.config.mjs` or `apps/docs/src/content.config.ts`, apply a one-off `pnpm --filter docs exec eslint . --fix` and review the diff. Both commands exit 0 (spec "pnpm lint runs in every workspace", "lint:root passes", "Astro files are not linted", "Normal lint ignores fixtures").
- [x] 2.5 GREEN: add an assertion in `tests/workspace/config.test.mjs` that no other `eslint.config.*` exists under `packages/` or `apps/` (Node fs traversal; spec "Workspaces use the root config").
- [x] 2.6 GREEN: run `pnpm test:workspace` then `git status --porcelain`; confirm no files changed by the suite (spec "Suite proves every acceptance criterion").
- [x] 2.7 REFACTOR: extract `lintFixture(path)` and `ruleIds(results)` helpers in `tests/workspace/lint.test.mjs`; tidy `eslint.config.js` structure.

# PR 2: aliases, turbo dry-run, docs (stacked-to-main: merge after PR 1; rebase onto main)

## Phase 4: Aliases and alias-resolution tests (PR 2)

Commit 4: `feat(lint): add base path aliases and resolve them in boundaries`

- [x] 4.1 RED: extend `tests/workspace/config.test.mjs`: `tsconfig.base.json` `compilerOptions.paths` has `@contexts/*`, `@core/*`, `@shared/*` mapping to `${configDir}/src/...` and no `baseUrl`; `tests/lint-fixtures/tsconfig.json` extends `../../tsconfig.base.json`. Observe failure. (spec: workspace-task-pipeline "Base declares path aliases"; workspace-linting "Aliases declared in the base")
- [x] 4.2 GREEN: edit `tsconfig.base.json` adding `paths` for the three aliases via `${configDir}` (no `baseUrl`); create `tests/lint-fixtures/tsconfig.json` (extends the base, `include: ["src/**/*.ts"]`). Verify `pnpm typecheck` exits 0 (spec "Typecheck still passes with aliases"; docs tsconfig unchanged).
- [x] 4.3 RED: add alias fixtures and cases to `tests/workspace/lint.test.mjs`: `contexts/listings/domain/imports-infrastructure-alias.ts` (`@contexts/listings/infrastructure/listing-store`) -> exactly `[BOUNDARIES_RULE]` (non-vacuous: proves alias resolution and that `no-restricted-imports` is silent); `contexts/listings/application/uses-domain-alias.ts` (`@contexts/listings/domain/listing`) -> `[]`; `contexts/listings/application/imports-other-context-alias.ts` (`@contexts/pricing/application/price-quote`) -> `[BOUNDARIES_RULE]`; `contexts/listings/infrastructure/adapters/pricing-alias.adapter.ts` -> `[]`; `misc/unsorted-imports-alias.ts` mixing all five groups including an alias -> `['simple-import-sort/imports']` and fixed output ordered built-ins, external, `@house-radar/*`, aliases, relative. Observe failures.
- [x] 4.4 GREEN: in `eslint.config.js` add the `project` list to the typescript resolver (absolute paths from `import.meta.dirname`: `tests/lint-fixtures/tsconfig.json` with a test-only comment, `packages/*/tsconfig.json`, `apps/*/tsconfig.json`) and the alias group `['^@(contexts|core|shared)(/.*|$)']` between `@house-radar` and relative in the sort groups. If the resolver does not expand `${configDir}`, apply the design fallback (relative `paths` block in the fixture tsconfig) and disclose.
- [x] 4.5 GREEN: run `pnpm test:workspace`, `pnpm lint`, `pnpm lint:root`, `git status --porcelain` clean.
- [x] 4.6 REFACTOR: dedupe alias fixtures and helpers.

## Phase 5: Turbo dry-run check (PR 2)

Commit 5: `test(turbo): assert lint task hashes the shared eslint config`

- [x] 5.1 RED: add a case to `tests/workspace/turbo-cli.test.mjs` running `turbo run lint --dry=json` through the existing helper and asserting the `lint` tasks of `docs` and `@house-radar/building-blocks` list `eslint.config.js` among hash inputs. Verify the exact dry-run field first (`pnpm turbo run lint --dry=json`); an absent key fails (RED).
- [x] 5.2 GREEN: the 1.5 config should satisfy it; if root external dependencies are not part of the global hash, also add `$TURBO_ROOT$/package.json` to `lint.inputs` in `turbo.json` and extend the 1.2 assertion.
- [x] 5.3 Manual verification (spec "Config edit causes cache miss"): run `pnpm lint` twice (second is a hit), touch `eslint.config.js` with a comment, run again and observe a miss; revert the touch. Record evidence in the apply report.

## Phase 6: Documentation (PR 2)

Commit 6: `docs: document eslint setup, aliases and lint scripts in conventions`

- [x] 6.1 Edit `apps/docs/src/content/docs/architecture/conventions.md` `## Tooling`: `lint` per workspace (`eslint .`), `lint:root`, the rule set (boundaries and context isolation, no `../` imports, import order groups, no explicit `any`), aliases declared once in `tsconfig.base.json` with `${configDir}`, fixtures ignored from normal lint, `.astro` not linted.
- [x] 6.2 Edit `apps/docs/src/content/docs/es/architecture/conventions.md` with the equivalent Spanish content (neutral register).
- [x] 6.3 GREEN checks: `pnpm docs:check-i18n` and `pnpm docs:build` exit 0.

## Phase 7: Final verification (end of PR 2)

- [x] 7.1 Run `pnpm lint`, `pnpm lint:root`, `pnpm typecheck`, `pnpm test`, `pnpm test:workspace`, `pnpm docs:check-i18n`, `pnpm docs:build`; all exit 0 and `git status --porcelain` shows only intended changes.
- [x] 7.2 Edit `openspec/config.yaml` to add `linter` commands (`pnpm lint`, `pnpm lint:root`) at verify/archive, if the file has a matching section.
- [x] 7.3 Record in the apply report: selected versions and `npm view` evidence, boundaries rule id and syntax, any fallback (`${configDir}`, `regex`, resolver, turbo inputs), and RED/GREEN evidence per phase.

## PR Slice Boundaries

- PR 1 (base: main; ~300-360 lines): Phases 1 and 2 (commits 1-3). Self-contained and fully tested: pins, scripts, turbo inputs, `eslint.config.js`, relative fixtures, `lint.test.mjs`, docs one-off `--fix`. Behaviour proven without aliases.
- PR 2 (base: main after PR 1 merges; ~200-240 lines): Phases 4 to 7 (commits 4-6, plus 7.2). Aliases, resolver project list, alias group and fixtures with their tests, turbo dry-run test, docs EN and ES, `openspec/config.yaml`.
- Contingency: if PR 1 measures over 400 lines, extract the import-sort slice as "PR 1b" (see forecast note).
