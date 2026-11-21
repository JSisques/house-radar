# Proposal: Turborepo and pnpm workspace scripts (S-M0-01)

Source: GitHub issue #16 (S-M0-01). Exploration: `openspec/changes/m0-turborepo-workspace/explore.md` (Engram `sdd/m0-turborepo-workspace/explore`).

## Intent

The monorepo has a pnpm workspace declaration but no task runner, no shared TypeScript baseline and only docs-specific root scripts (`docs:*`). Every later milestone (building-blocks, shared-kernel, api, ingestion, web) needs one uniform way to run `lint`, `typecheck`, `test`, `build` and `dev` across workspaces, in dependency order, with caching (ADR D2, D16). This change lays that foundation now, before the first real package lands, so later packages only add a `package.json` and inherit the pipeline.

Success means: a fresh clone runs `pnpm install && pnpm turbo run build typecheck` across all workspaces in dependency order, the second run is served from cache, a strict TypeScript error makes `pnpm typecheck` fail and names the offending package, and `apps/docs` keeps working through its existing scripts.

## Scope

### In Scope
- Root `package.json`: add exact-pinned devDependencies `turbo` (2.x, latest verified at apply time) and `typescript` `5.9.3`; add root scripts `lint`, `typecheck`, `test`, `build`, `dev` that delegate to `turbo run <task>`; add `test:workspace` for the root workspace suite. All existing `docs:*` scripts stay byte-for-byte unchanged.
- `pnpm-workspace.yaml`: keep the `apps/*` and `packages/*` globs (already present; verified, not rewritten unless needed).
- `turbo.json` (Turbo 2 `tasks` schema): `build` with `dependsOn: ["^build"]` and `outputs: ["dist/**"]` (plus docs output); `typecheck` with `dependsOn: ["^build"]`; `test` with `dependsOn: ["^build"]`; `lint` defined (no-op until ESLint lands); `dev` with `persistent: true` and `cache: false`.
- `tsconfig.base.json` (strict): `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `skipLibCheck`, `declaration`, target ES2022, `module: ESNext`, `moduleResolution: Bundler`. No decorator flags. `apps/docs` keeps extending Astro's strict config.
- `packages/building-blocks` empty shell: `@house-radar/building-blocks`, private, ESM, version `0.0.0`; `tsconfig.json` extending `../../tsconfig.base.json` plus `tsconfig.build.json` emitting to `dist/`; scripts `build` (`tsc -p tsconfig.build.json`), `typecheck` (`tsc --noEmit`), `test` (`vitest run --passWithNoTests`, Vitest as exact-pinned devDependency per D14); one explicit non-barrel source file (a package marker constant).
- `apps/docs/package.json`: additive `"typecheck": "astro check"` so docs joins the `typecheck` task; `docs:check` remains as the CI alias.
- `.gitignore`: add `.turbo` and `dist`.
- Root workspace test suite (`node:test`, run by `test:workspace`, not part of `turbo run test` to avoid recursion):
  - Config assertions: root scripts, pinned versions, `turbo.json` task shape, strict base tsconfig, building-blocks manifest, docs scripts preserved.
  - Scoped CLI behaviour tests: `turbo run build typecheck --filter=@house-radar/building-blocks` with an isolated `TURBO_CACHE_DIR`, asserting a cache miss then a cache hit; a temporary broken-TS fixture (created and removed in `try/finally`) asserting `typecheck` fails and names the package.
- Docs: update the `## Tooling` section of `apps/docs/src/content/docs/architecture/conventions.md` (Turborepo tasks, root scripts, strict base tsconfig, `test:workspace`) and its Spanish mirror under `apps/docs/src/content/docs/es/`, keeping EN/ES parity (`pnpm docs:check-i18n`).

### Out of Scope
- ESLint, Prettier, import-sort, husky, lint-staged, commitlint (later M0 stories; `lint` stays a no-op task).
- CI changes, including adding `turbo.json` / `tsconfig.base.json` to `.github/workflows/docs.yml` path filters and running turbo in CI (D16 follow-up).
- Docker, remote caching.
- Real content in `packages/building-blocks`, and `packages/shared-kernel` (S-M0-02 and later).
- Moving `check:i18n` into turbo.
- Choosing tsup/bundlers; tsc is the build tool for now.

## Capabilities

### New Capabilities
- `workspace-task-pipeline`: Root Turborepo task pipeline and pnpm workspace contract — root scripts (`lint`, `typecheck`, `test`, `build`, `dev`, `test:workspace`), task graph and caching semantics, strict shared TypeScript baseline, workspace membership (including `apps/docs` compatibility and preserved `docs:*` scripts), and the `@house-radar/building-blocks` placeholder package shape.

### Modified Capabilities
- None (`openspec/specs/` is empty).

## Approach

Exploration recommendation A, as decided:

1. Strict TDD: write the root `node:test` workspace suite first (RED), covering config assertions and the scoped CLI behaviour checks, then add configuration until it passes (GREEN).
2. Add `turbo` and `typescript` as exact-pinned root devDependencies; define the Turbo 2 `tasks` graph with `^build` so dependency order is enforced as soon as a real edge exists (today the graph is shown through `--dry=json`, since no workspace depends on another yet).
3. Add `tsconfig.base.json` and the tsc-built building-blocks shell, wiring Vitest now with `--passWithNoTests` so the `test` task is proven in the pipeline.
4. Make `apps/docs` a full participant through an additive `typecheck` script only; leave every existing docs and root `docs:*` script untouched.
5. CLI tests isolate cache with a temporary `TURBO_CACHE_DIR`, scope with `--filter` to keep `astro build` out of the cache assertions, and clean the broken-TS fixture in `finally` so the tree stays clean.
6. Update the conventions Tooling section in EN and ES.

Rationale: config assertions give fast deterministic RED; a narrow behaviour slice proves AC1/AC2 for real without making the suite slow or flaky; keeping `test:workspace` outside turbo avoids recursion.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | turbo/typescript devDeps, root task scripts, `test:workspace`; `docs:*` unchanged |
| `pnpm-workspace.yaml` | Unchanged (verified) | Already lists `apps/*`, `packages/*` |
| `turbo.json` | New | Turbo 2 task graph |
| `tsconfig.base.json` | New | Strict shared TS baseline |
| `packages/building-blocks/package.json` | New | Placeholder package manifest |
| `packages/building-blocks/tsconfig.json`, `tsconfig.build.json` | New | Extend base; build to `dist/` |
| `packages/building-blocks/src/<marker>.ts` | New | Single non-barrel source file |
| `apps/docs/package.json` | Modified | Additive `typecheck: astro check` |
| `.gitignore` | Modified | `.turbo`, `dist` |
| `scripts/` or `tests/` at root (workspace suite) | New | `node:test` config + CLI behaviour tests |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modified | Tooling section |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modified | ES mirror of Tooling section |
| `pnpm-lock.yaml` | Modified (generated) | Excluded from line forecast |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Turbo behaviour (cache hit, failing-package naming) not verified locally during explore | Med | CLI behaviour tests prove AC1/AC2 at apply; pin the turbo version verified then |
| `astro check` / `astro build` in the graph makes tests slow or flaky | Med | `--filter` scoping and isolated `TURBO_CACHE_DIR` in behaviour tests |
| Broken-TS fixture leaves the tree dirty on crash | Low | Create under a temp path in the package, remove in `try/finally`; `.gitignore` fallback |
| `astro check` may require `@astrojs/check` dependency | Med | Verify at apply; add it to `apps/docs` devDependencies if required (additive) |
| CI path filters ignore new root config files | Low | Documented out-of-scope follow-up (D16 CI story) |
| `openspec/config.yaml` still names `pnpm docs:test` as workspace test command | Low | Update at archive/verify to include `pnpm test` and `pnpm test:workspace` |

## Rollback Plan

The change is additive configuration in one slice. Revert the work-unit commit(s) with `git revert`, then run `pnpm install` to restore the lockfile. `apps/docs` and its CI are unaffected because the `docs:*` scripts and docs build path are not changed; removing `turbo.json`, `tsconfig.base.json`, `packages/building-blocks` and the root test suite returns the repo to its current state.

## Dependencies

- npm registry access at apply time to install `turbo`, `typescript` 5.9.3 and `vitest` (and possibly `@astrojs/check`).
- Node >= 24 and pnpm 10.34.6 (already declared).

## Success Criteria

- [ ] AC1: On a fresh clone, `pnpm install && pnpm turbo run build typecheck` runs every workspace in dependency order; a second identical run reports full cache hits.
- [ ] AC2: Introducing a strict TypeScript error makes `pnpm typecheck` exit non-zero and the output names the failing package.
- [ ] AC3: `apps/docs` is a workspace member; `pnpm docs:dev`, `docs:build`, `docs:check`, `docs:test`, `docs:check-i18n` behave as before.
- [ ] `pnpm test` runs building-blocks Vitest (`--passWithNoTests`) and docs `node:test` through turbo.
- [ ] `pnpm test:workspace` passes, including the scoped CLI behaviour tests, and leaves a clean git tree.
- [ ] Conventions Tooling section updated in EN and ES; `pnpm docs:check-i18n` passes.
- [ ] Authored diff stays within the 400-line budget (forecast ~270–340, single slice).
