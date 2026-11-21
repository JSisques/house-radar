# Tasks: Turborepo and pnpm workspace scripts (S-M0-01)

Change: `m0-turborepo-workspace`. Inputs: `proposal.md`, `specs/workspace-task-pipeline/spec.md`, `design.md`.
Strict TDD is active. Test runner: `node --test --test-concurrency=1 'tests/workspace/*.test.mjs'` (root `test:workspace`). Regression guards: `pnpm docs:test`, `pnpm docs:check`, `pnpm docs:check-i18n`, `pnpm docs:build`.
Commit style: Conventional Commits, no AI attribution. Each work-unit commit carries its tests and docs.

## Review Workload Forecast

| Item | Value |
| --- | --- |
| Estimated authored changed lines (lockfile excluded) | about 280-330 (config.test ~110, turbo-cli.test ~90, support ~30, configs/manifests ~70, docs EN+ES ~30) |
| 400-line budget risk | Low |
| Chained PRs recommended | No (single PR, three work-unit commits) |
| Decision needed before apply | No (chain_strategy not needed; revisit only if the running count exceeds 400) |
| Delivery strategy | auto-chain (inactive while under budget) |

### Proposed commit boundaries

| Commit | Tasks | Message (suggested) | Approx. lines |
| --- | --- | --- | --- |
| WU-1 | 1.1-1.7 | `feat: add turborepo task pipeline and strict base tsconfig` | 190-220 |
| WU-2 | 2.1-2.5 | `test: add scoped turbo cli behaviour tests for cache and strict errors` | 80-100 |
| WU-3 | 3.1-3.3 | `docs: document turborepo tasks and workspace tests in conventions` | 30-40 |

## Phase 1: Config contract and pipeline (WU-1)

- [x] 1.1 RED. Write `tests/workspace/config.test.mjs` and a minimal `tests/workspace/support.mjs` (`repoRoot`, `readJson`). Cover every row of the design's config assertion table: root scripts, pins, docs characterization guard (green by design, labelled), workspace globs, `turbo.json` shape, strict base, building-blocks manifest and tsconfigs, no barrel, gitignore. Run `node --test tests/workspace/config.test.mjs` and record the observed failures (first failing test: root scripts). Spec: Root scripts, Pinned toolchain, Task graph, Strict baseline, Membership, Placeholder package.
- [x] 1.2 GREEN. Edit root `package.json`: append `build`, `dev`, `lint`, `test`, `typecheck` (`turbo run <task>`) and `test:workspace` after the unchanged `docs:*` scripts; add devDependencies `turbo` (exact 2.x, verify latest at apply) and `typescript` `5.9.3`. Run `pnpm install`. Spec: Root scripts delegate to Turborepo, Pinned toolchain.
- [x] 1.3 GREEN. Create `turbo.json` exactly as in design (`tasks` schema, `ui: stream`, `globalDependencies: ["tsconfig.base.json"]`). Create `tsconfig.base.json` with the decided strict options (`moduleResolution: Bundler`, no decorator flags). Spec: Task graph and caching, Strict shared TypeScript baseline.
- [x] 1.4 GREEN. Create `packages/building-blocks/` with `package.json` (private ESM, subpath export `./package-marker`, scripts, exact pinned `typescript` and `vitest` verified at apply), `tsconfig.json`, `tsconfig.build.json` and `src/package-marker.ts` (no `index.ts`). Run `pnpm install`. Spec: building-blocks placeholder package.
- [x] 1.5 GREEN. Add `"typecheck": "astro check"` to `apps/docs/package.json` (additive only). Add `__workspace_fixture_*` to `.gitignore` (`dist/` and `.turbo/` already present). Spec: Docs joins typecheck additively.
- [x] 1.6 Verify GREEN. Run `node --test tests/workspace/config.test.mjs` until it passes. Manually check: `pnpm lint` exits 0 (open question: no-op on the pinned turbo), `pnpm test` exits 0 (Vitest `--passWithNoTests` plus docs `node:test`), `pnpm --filter @house-radar/building-blocks build` emits `dist/`.
- [x] 1.7 REFACTOR and commit WU-1. Confirm `pnpm docs:test`, `docs:check`, `docs:check-i18n` still pass. Commit with the message above (tests and config together, lockfile included).

## Phase 2: CLI behaviour tests (WU-2)

- [x] 2.1 RED. Extend `support.mjs` with `BUILDING_BLOCKS`, `strictErrorFixture` and `runTurbo(args, { cacheDir })` (spawnSync, no shell, fixed cwd, isolated env, 120 s timeout). Write `tests/workspace/turbo-cli.test.mjs`: `before` creates a temp `TURBO_CACHE_DIR` and removes any stale fixture, `after` removes both. Spec: Workspace test suite and clean tree.
- [x] 2.2 AC1 test. Unfiltered `turbo run build typecheck --dry=json` lists `docs#build`, `docs#typecheck`, `@house-radar/building-blocks#build`, `#typecheck`, each with `^build` in `dependsOn`. Then filtered dry run reports all `MISS`, real run exits 0, filtered dry run reports all `HIT`, replay exits 0 and matches `/FULL TURBO/`. Verify the `--dry=json` field names on the pinned turbo and adjust paths, not intent (open question). Spec: Fresh clone runs build and typecheck, Second run is served from cache, Dependency order.
- [x] 2.3 AC2 test. In `try/finally`, write `src/__workspace_fixture_strict_error__.ts` (`export function untyped(value) { return value; }`), run `turbo run typecheck --filter=@house-radar/building-blocks --force` with a fresh cache dir; assert non-zero exit, output matches `/@house-radar\/building-blocks[#:]typecheck/` and `/TS7006/`; remove the fixture in `finally` and assert it no longer exists. Observe RED per the design's TDD order (temporarily break the base wiring, or comment out the fixture write once to see the assertion fail) and record the result. Spec: Strict TypeScript failure is reported with the package name.
- [x] 2.3b Add a `noUncheckedIndexedAccess` case (array index used as defined value) asserting `typecheck` fails, using the same fixture lifecycle. Spec: Index access is checked strictly.
- [x] 2.4 GREEN. Fix any graph or cache gap found (outputs, `globalDependencies`, `ui` mode). Run the full `pnpm test:workspace`; target under 30 s, apply the split fallback in the design only if consistently over 60 s.
- [x] 2.5 REFACTOR and commit WU-2. Confirm `git status --porcelain` is clean after the suite (ignored `.turbo`/`dist` excepted). Commit.

## Phase 3: Documentation and closure (WU-3)

- [x] 3.1 Update `## Tooling` in `apps/docs/src/content/docs/architecture/conventions.md`: Turborepo bullet (tasks, root scripts, `^build`, local cache), TypeScript bullet (strict base, `apps/docs` keeps Astro config), Workspace tests bullet (`pnpm test:workspace` outside turbo). Spec: Conventions documentation parity.
- [x] 3.2 Mirror the same bullets in `apps/docs/src/content/docs/es/architecture/conventions.md` (`## Herramientas`, neutral Spanish, `/es/adr/...` links).
- [x] 3.3 Run `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:test`, `pnpm docs:build`, `pnpm test:workspace`, `pnpm test`, then manual full `pnpm turbo run build typecheck` twice (second run full cache hit). Commit WU-3. Record commit hashes in the feature document.

## Dependencies and parallelism

- Sequential: 1.1 -> 1.2/1.3/1.4/1.5 -> 1.6 -> 1.7 -> 2.x -> 3.x (CLI tests need the GREEN config; docs close last).
- Parallel within a group: 1.2, 1.3, 1.4, 1.5 touch disjoint files and may be done in any order, but `pnpm install` runs after 1.2 and again after 1.4.
- 3.1 and 3.2 are independent of each other but must land in the same commit for parity.
- Out of scope: ESLint/Prettier/hooks, CI path filters, Docker, remote cache, shared-kernel, alias-resolving build tool (deferred to S-M0-02; tsc stays).
- Follow-up at verify/archive: update `openspec/config.yaml` test commands to include `pnpm test` and `pnpm test:workspace`.
