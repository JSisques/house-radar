# Design: Turborepo and pnpm workspace scripts (S-M0-01)

Inputs: `proposal.md` (Engram `sdd/m0-turborepo-workspace/proposal`), `explore.md`. ADRs: D2 (pnpm + Turborepo monorepo), D14 (Strict TDD, Vitest `*.spec.ts`), D16 (lint/typecheck/test/build through Turborepo).

## Technical Approach

Add a Turbo 2 task graph at the root, a strict shared TypeScript baseline and an empty, tsc-built `@house-radar/building-blocks` package, so that every later workspace only adds a `package.json` with the standard script names and inherits the pipeline. `apps/docs` joins the graph through one additive `typecheck` script; its existing scripts and the root `docs:*` scripts stay byte-for-byte unchanged, which keeps `.github/workflows/docs.yml` working.

Verification is a root `node:test` suite (`pnpm test:workspace`) that lives outside the turbo graph (no recursion). It has two files that run serially:

1. `config.test.mjs`: fast, deterministic assertions over the JSON configuration files (first RED).
2. `turbo-cli.test.mjs`: scoped CLI behaviour tests that spawn the pinned turbo binary against `@house-radar/building-blocks` only, with an isolated `TURBO_CACHE_DIR`. They prove AC1 (dependency graph, then a cache miss followed by a cache hit) and AC2 (a strict TS error fails `typecheck` and names the package).

Facts verified in the repository during design:

- `.gitignore` already contains `dist/` and `.turbo/`. The proposal's "add `.turbo` and `dist`" item is already satisfied. The only `.gitignore` addition is the fixture pattern (see the fixture decision).
- `apps/docs` already has `@astrojs/check` `0.9.12` and `typescript` `5.9.3` as devDependencies. No dependency is added to docs.
- `apps/docs/astro.config.mjs` sets no `outDir`, so the Astro build output is the default `dist/`. `dist/**` covers both workspaces.
- `pnpm-lock.yaml` exists. Turbo needs it to build the workspace graph.
- The existing test pattern is `node:test` + `node:assert/strict` in `.mjs` files (`apps/docs/scripts/i18n-parity.test.mjs`). The root suite follows it.

## Architecture Decisions

### Decision: Exact `turbo.json` task graph

**Choice**:

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "stream",
  "globalDependencies": ["tsconfig.base.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- `inputs` is omitted on every task. Turbo's default is all git-tracked, non-ignored files of the package (`$TURBO_DEFAULT$`), which is what we want.
- `globalDependencies: ["tsconfig.base.json"]` is required. Default inputs are package-scoped, so without it an edit to the root strict baseline would replay stale cached `typecheck`/`build` results for every package that extends it. The cost is that `apps/docs` (which does not extend the base) is also invalidated by base edits. That is accepted because the base changes rarely.
- `typecheck` and `test` depend on `^build` because consumers type-check and test against the built `dist/` declarations of their workspace dependencies (`exports` point at `dist`).
- `lint` has no `dependsOn` and no package defines a `lint` script yet, so `turbo run lint` runs nothing and exits 0. ESLint lands in a later M0 story.
- `dev` uses `cache: false` and `persistent: true`. It has no `dependsOn`, because the only `dev` today is `astro dev`. A future app that needs built dependencies adds `dependsOn: ["^build"]` at that point.
- `ui: "stream"` keeps the output line-prefixed (`<package>:<task>:`). This makes CI logs and the AC2 assertion deterministic, so the interactive TUI never activates.

**Alternatives considered**: per-task `inputs` with `$TURBO_ROOT$/tsconfig.base.json` (more precise, but it depends on a newer turbo feature and adds noise for no gain today). `typecheck` with `dependsOn: ["^typecheck"]` (it does not produce the `dist/` declarations that consumers resolve through `exports`). `ui: "tui"` (non-deterministic output in tests).

**Rationale**: this is the smallest graph that satisfies D16 and AC1/AC2 and stays correct once real dependency edges exist.

### Decision: Strict `tsconfig.base.json`

**Choice**:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "declaration": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

The base sets no `include`, `outDir`, `rootDir` or `noEmit`, because those are per-package. It sets no decorator flags: NestJS apps add `experimentalDecorators`/`emitDecoratorMetadata` in their own tsconfig. `lib` is `ES2022` without `DOM`, because packages are framework-free. `apps/web` adds `DOM` itself. `apps/docs` is not touched and keeps `extends: "astro/tsconfigs/strict"`.

**Alternatives considered**: adding `exactOptionalPropertyTypes` and `verbatimModuleSyntax` now (not decided; they can be added with real code in S-M0-02). `moduleResolution: NodeNext` (rejected by the decided baseline; see Open Questions for the Node-consumer implication).

**Rationale**: these are exactly the decided flags, plus `lib` and `forceConsistentCasingInFileNames`, which are inert safety settings.

### Decision: building-blocks tsconfig split

**Choice**:

`packages/building-blocks/tsconfig.json` (type-check scope, includes future specs):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "noEmit": true },
  "include": ["src/**/*.ts"]
}
```

`packages/building-blocks/tsconfig.build.json` (emit scope):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src",
    "outDir": "dist"
  },
  "exclude": ["src/**/*.spec.ts"]
}
```

`noEmit: true` in `tsconfig.json` makes a bare `tsc` safe, because it never emits `.js` next to the sources. The `typecheck` script still passes `--noEmit` explicitly, as decided.

**Alternatives considered**: a single tsconfig with `outDir` (specs would be emitted into `dist`). `tsconfig.build.json` extending the base directly (this duplicates `include` and drifts).

**Rationale**: one source of truth for scope, and the build only narrows it.

### Decision: building-blocks manifest and marker file

**Choice**: `packages/building-blocks/package.json`:

```json
{
  "name": "@house-radar/building-blocks",
  "version": "0.0.0",
  "private": true,
  "license": "AGPL-3.0-only",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./package-marker": {
      "types": "./dist/package-marker.d.ts",
      "default": "./dist/package-marker.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "vitest": "<exact 4.x pin verified at apply>"
  }
}
```

Marker file `packages/building-blocks/src/package-marker.ts`:

```ts
export const BUILDING_BLOCKS_PACKAGE_NAME = '@house-radar/building-blocks';
```

- There is no `index.ts` and no `"."` export. The package exposes explicit subpath exports only, which complies with the no-barrel rule. S-M0-02 may switch to a wildcard subpath (`"./*"`) once real modules exist.
- `typescript` is declared in the package as well as at the root. Each workspace declares the tools its scripts invoke, so resolution does not depend on pnpm putting the root `.bin` on PATH. The root pin remains for root-level tooling and editors.
- There is no `vitest.config.ts`. The defaults (`**/*.{test,spec}.?(c|m)[jt]s?(x)`, node environment) are enough, and with `--passWithNoTests` an empty package exits 0. A config file is added only when the package needs one.

**Alternatives considered**: a `"."` export to `index.ts` (a barrel, forbidden). A vitest config file now (dead config). typescript only at the root (implicit PATH coupling).

**Rationale**: this is the smallest valid ESM package that builds, type-checks and tests through turbo.

### Decision: root scripts

**Choice**: append to the root `scripts`, after the unchanged `docs:*` entries:

```json
"build": "turbo run build",
"dev": "turbo run dev",
"lint": "turbo run lint",
"test": "turbo run test",
"typecheck": "turbo run typecheck",
"test:workspace": "node --test --test-concurrency=1 'tests/workspace/*.test.mjs'"
```

Root `devDependencies`: `"turbo": "<exact 2.x pin verified at apply>"` and `"typescript": "5.9.3"`. `apps/docs/package.json` gains only `"typecheck": "astro check"`. `docs:check` stays as `pnpm --filter docs exec astro check`.

`--test-concurrency=1` is mandatory. `node:test` runs files in parallel by default, and the AC2 fixture temporarily breaks `building-blocks`, which would race with any concurrent read or build of that package.

**Rationale**: these are uniform task names per D16. `test:workspace` stays outside `turbo run test`, so running the turbo test task never re-enters the suite that spawns turbo.

### Decision: root test suite location and layout

**Choice**: `tests/workspace/` at the repository root:

| File | Purpose |
| --- | --- |
| `tests/workspace/support.mjs` | Helpers: `repoRoot` (resolved from `import.meta.url`), `readJson(relPath)`, `runTurbo(args, { cacheDir })`, fixture path constant. Not matched by the `*.test.mjs` glob. |
| `tests/workspace/config.test.mjs` | Static configuration assertions. |
| `tests/workspace/turbo-cli.test.mjs` | Scoped CLI behaviour tests (AC1, AC2). Tests inside one file run sequentially. |

**Alternatives considered**: `scripts/` at the root (in this repo `scripts/` holds scripts next to their own tests, as in `apps/docs/scripts`, and these tests have no script under test). A `packages/workspace-tests` workspace (it would join `turbo run test` and recurse).

**Rationale**: `tests/` names the intent. The root is not a workspace package, so turbo never schedules it.

### Decision: how `runTurbo` spawns the CLI

**Choice**: `spawnSync(path.join(repoRoot, 'node_modules/.bin/turbo'), args, { cwd: repoRoot, encoding: 'utf8', env: { ...process.env, TURBO_CACHE_DIR: cacheDir, TURBO_TELEMETRY_DISABLED: '1', TURBO_NO_UPDATE_NOTIFIER: '1', DO_NOT_TRACK: '1' } })`. It uses no shell, an argument array, a fixed cwd and a per-test timeout of 120 s. It returns `{ status, output: stdout + stderr }`.

The test calls the pinned turbo binary directly instead of `pnpm typecheck --filter=...`. This avoids pnpm argument forwarding ambiguity and keeps the command exact. A config assertion pins the link to the root script: `scripts.typecheck === 'turbo run typecheck'` and `scripts.build === 'turbo run build'`. The full, unfiltered `pnpm typecheck` with an injected error stays a manual verify-phase check.

**Alternatives considered**: `pnpm exec turbo` (an extra process layer for no benefit). `shell: true` (quoting and injection surface for no benefit).

### Decision: AC1 assertions (graph, then cache miss, then cache hit)

**Choice**: in `turbo-cli.test.mjs`, with `cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'house-radar-turbo-'))` created in `before` and removed in `after`:

1. **Graph over every workspace (dry, no execution)**: run `turbo run build typecheck --dry=json`, unfiltered. This is cheap, because Astro is not run. Parse stdout as JSON and assert that `tasks[].taskId` contains `docs#build`, `docs#typecheck`, `@house-radar/building-blocks#build` and `@house-radar/building-blocks#typecheck`. Also assert that each task's `resolvedTaskDefinition.dependsOn` includes `^build`. This is the "dependency order" proof while no real edge exists.
2. **Cold miss**: `turbo run build typecheck --filter=@house-radar/building-blocks --dry=json`. Every `tasks[].cache.status` is `MISS`.
3. **Real run**: `turbo run build typecheck --filter=@house-radar/building-blocks` exits 0.
4. **Warm hit**: repeat step 2. Every `tasks[].cache.status` is `HIT`.
5. **Replay**: repeat step 3. It exits 0 and the output matches `/FULL TURBO/`. This is a secondary signal. The structured `--dry=json` status in step 4 is the authoritative assertion.

`--dry=json` was chosen over `--summarize` because it prints structured JSON to stdout and writes no `.turbo/runs/*.json` files into the repository.

### Decision: AC2 fixture and failing-package assertion

**Choice**:

- Fixture path: `packages/building-blocks/src/__workspace_fixture_strict_error__.ts`. It is inside `src/`, so `tsconfig.json`'s `include` picks it up.
- Content: `export function untyped(value) { return value; }`. This is a `noImplicitAny` error (TS7006), so it only fails when the strict base is effective. It proves that the baseline is wired, not merely that tsc runs.
- `.gitignore` addition: `__workspace_fixture_*`. If a run is killed hard before `finally`, the tree still reports clean.
- Lifecycle: `before` and `finally` both call `fs.rmSync(fixture, { force: true })`, so a stale fixture from a crashed run is cleaned before AC1 runs. The AC2 test writes the fixture inside `try` and removes it in `finally`. A last assertion checks `fs.existsSync(fixture) === false`.
- Command: `turbo run typecheck --filter=@house-radar/building-blocks --force` with a fresh `TURBO_CACHE_DIR`.
- Assertions: `status !== 0`. The output matches `/@house-radar\/building-blocks[#:]typecheck/` (the turbo line prefix and the failure summary both name `<package>#<task>` or `<package>:<task>`). The output matches `/TS7006/`.

**Gotcha resolved**: because the fixture is gitignored, turbo's default inputs exclude it and the task hash does not change. Without `--force`, a previously cached successful `typecheck` would be replayed, and the test would falsely pass the "no error" path or fail for the wrong reason. `--force` together with the isolated cache dir guarantees that tsc actually runs.

**Alternatives considered**: a temporary workspace package `packages/__fixture__` (turbo/pnpm would see a package missing from the lockfile, and it would dirty the tree). A fixture copied into `os.tmpdir()` (it would not exercise the real package, tsconfig chain or turbo naming). A tracked fixture file (it would permanently break `typecheck`).

### Decision: config assertions (`config.test.mjs`)

| Test | Assertion |
| --- | --- |
| root scripts | `build/dev/lint/test/typecheck === 'turbo run <task>'`; `test:workspace` runs `node --test` over `tests/workspace/*.test.mjs` |
| root pins | `devDependencies.turbo` matches `/^2\.\d+\.\d+$/` (exact, no range); `devDependencies.typescript === '5.9.3'` |
| docs compatibility | the five `docs:*` values equal the current strings exactly (characterization guard, green from the start); `apps/docs` `typecheck === 'astro check'`; the other docs scripts are unchanged |
| workspace globs | `pnpm-workspace.yaml` contains `apps/*` and `packages/*` (line match, no YAML dependency) |
| turbo.json | the `tasks` key exists and `pipeline` is absent; build/typecheck/test `dependsOn` deep-equals `['^build']`; `build.outputs` deep-equals `['dist/**']`; `dev.cache === false` and `dev.persistent === true`; `lint` is defined; `globalDependencies` includes `tsconfig.base.json` |
| strict base | the decided `compilerOptions` subset deep-equals the expected values; there are no `experimentalDecorators` or `emitDecoratorMetadata` keys |
| building-blocks manifest | name, `private`, `type: module`, `version: 0.0.0`, scripts exact; `exports` has no `"."` key; every export target points into `./dist/`; exact (non-range) devDependency pins |
| building-blocks tsconfigs | `tsconfig.json` extends `../../tsconfig.base.json`; `tsconfig.build.json` extends `./tsconfig.json` with `outDir: dist` |
| no barrel | `packages/building-blocks/src/index.ts` does not exist |
| gitignore | contains `dist/`, `.turbo/` and `__workspace_fixture_*` |

All files are JSON, so they are read with `JSON.parse(fs.readFileSync(...))`. tsconfig files written by this change contain no comments, so `JSON.parse` is valid.

### Decision: if a CLI behaviour test is too slow

**Choice**: the target is under 30 s for `pnpm test:workspace` locally. Each CLI test has `timeout: 120_000`. If the suite consistently exceeds 60 s, take these steps in order:

1. Confirm that every executed command is `--filter`-scoped. Only the dry-run graph check is unfiltered.
2. Split the suite into `test:workspace` (config only) and `test:workspace:cli` (behaviour), and record the split in the feature document.

The CLI tests are never skipped silently or by environment flag.

### Decision: conventions documentation

**Choice**: in `## Tooling` (EN) and `## Herramientas` (ES), prepend one **Turborepo** bullet: the tasks `build`, `typecheck`, `test`, `lint` and `dev`, the root `pnpm <task>` scripts, `^build` ordering and local caching. Add one **TypeScript** bullet: `tsconfig.base.json` is strict, packages extend it, and `apps/docs` extends Astro's strict config. Add one **Workspace tests** bullet: `pnpm test:workspace` runs outside turbo. The ES text is a neutral, professional translation and links use the `/es/adr/...` form. Parity is checked by `pnpm docs:check-i18n`.

## Data Flow

```
pnpm <task> ──→ turbo run <task> ──→ package graph (pnpm-workspace.yaml + pnpm-lock.yaml)
                     │                     │
                     │        ┌────────────┴─────────────┐
                     │   @house-radar/building-blocks    docs
                     │   build: tsc -p tsconfig.build    build: astro build
                     │   typecheck: tsc --noEmit         typecheck: astro check
                     │   test: vitest run --passWith..   test: node --test scripts/*
                     │
                     └──→ hash(package inputs + tsconfig.base.json) ──→ local cache (.turbo / TURBO_CACHE_DIR)

pnpm test:workspace ──→ node --test (serial)
                          ├─ config.test.mjs   ──→ reads JSON configs
                          └─ turbo-cli.test.mjs ─→ spawnSync(node_modules/.bin/turbo, --filter, TURBO_CACHE_DIR=tmp)
```

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `package.json` | Modify | Add `build/dev/lint/test/typecheck` (turbo) and `test:workspace`. Add devDependencies `turbo` (exact 2.x) and `typescript` 5.9.3. `docs:*` unchanged. |
| `turbo.json` | Create | Turbo 2 task graph as specified above. |
| `tsconfig.base.json` | Create | Strict shared baseline. |
| `packages/building-blocks/package.json` | Create | Placeholder ESM package, subpath export to the marker, scripts, exact devDependencies. |
| `packages/building-blocks/tsconfig.json` | Create | Extends the base, `noEmit`, `include: src/**/*.ts`. |
| `packages/building-blocks/tsconfig.build.json` | Create | Extends `./tsconfig.json`, emits to `dist/`, excludes specs. |
| `packages/building-blocks/src/package-marker.ts` | Create | `BUILDING_BLOCKS_PACKAGE_NAME` constant (non-barrel). |
| `apps/docs/package.json` | Modify | Add `"typecheck": "astro check"` only. |
| `.gitignore` | Modify | Add `__workspace_fixture_*` (`dist/` and `.turbo/` already present). |
| `tests/workspace/support.mjs` | Create | Shared helpers (`repoRoot`, `readJson`, `runTurbo`, fixture path). |
| `tests/workspace/config.test.mjs` | Create | Config assertions. |
| `tests/workspace/turbo-cli.test.mjs` | Create | AC1/AC2 scoped behaviour tests. |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modify | Tooling: Turborepo, strict base, `test:workspace`. |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modify | ES mirror of the same bullets. |
| `pnpm-lock.yaml` | Modify (generated) | Excluded from the line forecast. |
| `pnpm-workspace.yaml` | Unchanged | Already lists `apps/*` and `packages/*`. |

Forecast: about 260–320 authored lines, in a single slice under the 400-line budget.

## Interfaces / Contracts

```js
// tests/workspace/support.mjs
export const repoRoot;                       // absolute path, from import.meta.url
export const BUILDING_BLOCKS = '@house-radar/building-blocks';
export const strictErrorFixture;             // absolute path to __workspace_fixture_strict_error__.ts
export function readJson(relativePath);      // JSON.parse of a repo-relative file
export function runTurbo(args, { cacheDir }); // -> { status: number | null, output: string }
```

The workspace task contract for future packages is: a package joins a task only by defining a script with that exact name (`build`, `typecheck`, `test`, `lint`, `dev`). Build output goes to `dist/`.

## Testing Strategy

| Layer | What to test | Approach |
| --- | --- | --- |
| Unit (config) | Root scripts and pins, turbo.json shape, strict base, building-blocks manifest and tsconfigs, docs compatibility, gitignore | `config.test.mjs`, `node:test` + `assert/strict` over parsed JSON |
| Integration (CLI) | AC1 graph across all workspaces, cache miss then hit | `turbo-cli.test.mjs`: unfiltered `--dry=json`, then filtered real runs with isolated `TURBO_CACHE_DIR` |
| Integration (CLI) | AC2 strict error fails `typecheck` and names the package | Gitignored fixture, `--force`, assert non-zero exit + `@house-radar/building-blocks` + `TS7006`; `try/finally` cleanup |
| Pipeline | `pnpm test` runs Vitest (no tests) + docs `node:test` | Manual or verify run of `pnpm test` (exit 0) |
| Regression (AC3) | Docs scripts behave as before | Verify phase: `pnpm docs:test`, `docs:check`, `docs:check-i18n`, `docs:build` |

### Strict TDD order

1. **RED 1** (`config.test.mjs`, first test): `root package.json defines turbo task scripts`. It fails because no `typecheck`/`build` script exists. Run it with `node --test tests/workspace/config.test.mjs` before `test:workspace` exists. The rest of the config tests are written in the same step and observed failing, except the `docs:*` characterization guard, which is green by design and is labeled as such.
2. **GREEN 1**: root scripts and devDependencies, `pnpm install`, `turbo.json`, `tsconfig.base.json`, the building-blocks files, docs `typecheck` and `.gitignore`, until `config.test.mjs` passes.
3. **RED 2** (`turbo-cli.test.mjs`): write the AC1 and AC2 tests. AC2 RED is observed by temporarily running against the package before `tsconfig.json` extends the base, or before `strict` is set. Otherwise record that AC2 is green on first run because GREEN 1 already delivered its configuration, and confirm that the test can fail by commenting out the fixture write once (the assertion goes red because the exit is 0).
4. **GREEN 2**: fix any graph or caching gap found by the CLI tests, for example `globalDependencies`, outputs or the `ui` mode.
5. **REFACTOR**: extract `support.mjs` helpers. Update the conventions docs in EN and ES, then run `pnpm docs:check-i18n`.

## Threat Matrix

The change spawns a subprocess only inside its own test suite: a fixed binary path, an argument array, no shell, a fixed cwd and no user input. It adds no routing, VCS/PR automation or executable-file classification.

| Boundary | Applicability | Design response | Planned RED tests |
| --- | --- | --- | --- |
| Documentation-like paths | N/A: no file classification or execution of repository files by type | None | None |
| Git repository selection | N/A: no git commands are run, and the cwd is fixed to `repoRoot` | None | None |
| Commit state | N/A: there is no commit automation, and a clean tree is guaranteed by `finally` + gitignore, not by git | None | None |
| Push state | N/A: no push | None | None |
| PR commands | N/A: no PR automation | None | None |

## Migration / Rollout

No migration is required. The change is additive. `.github/workflows/docs.yml` keeps calling the unchanged `docs:*` scripts. Follow-ups that are out of scope: add `turbo.json` and `tsconfig.base.json` to the CI path filters and run turbo in CI (a D16 story), and update `openspec/config.yaml` (`workspace_test_command`, `strict_tdd_note`) to `pnpm test` + `pnpm test:workspace` at verify/archive.

## Open Questions

- [ ] Verify at apply: the turbo 2.x `--dry=json` field names (`tasks[].taskId`, `tasks[].cache.status` with `HIT`/`MISS`, `resolvedTaskDefinition.dependsOn`) for the pinned version. Adjust the field paths in the test, not the assertion intent.
- [ ] Verify at apply: `turbo run lint` with no package defining `lint` exits 0 on the pinned version. If it does not, record the behaviour and keep `lint` defined, per the decision.
- [ ] Non-blocking, for S-M0-02: `moduleResolution: Bundler` is confirmed (user decision). Conventions require `@`-prefixed path aliases (`@contexts/*`, `@core/*`, `@shared/*`) for cross-directory imports, and tsc does not rewrite `paths` aliases or add extensions in emitted output. A build step that resolves aliases (for example, tsup/esbuild for packages, and Nest CLI with SWC for apps) is therefore required. Choose that tool when the first aliased import lands. The empty shell needs none, so `tsc` stays for now.
