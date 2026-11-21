# Design: ESLint flat config with boundaries and import sorting (S-M0-02)

Inputs: `proposal.md` (this folder; Engram `sdd/m0-eslint-flat-config/proposal`), exploration Engram `sdd/m0-eslint-flat-config/explore`, `apps/docs/src/content/docs/architecture/conventions.md` (Principles, Backend Structure and Layers, Tooling), existing `tests/workspace/{support,config.test,turbo-cli.test}.mjs`, `turbo.json`, `tsconfig.base.json`, root and workspace `package.json` files. The spec phase may run in parallel; this design maps to the proposal's AC1–AC4 and success criteria.

## Technical Approach

One ESM flat config at the repository root (`eslint.config.js`) is the single source of lint rules. Each workspace runs `eslint .`; ESLint walks up from the workspace to find the root config. Root files (`tests/**`, `eslint.config.js`) are linted by a root `lint:root` script outside turbo, mirroring `test:workspace`.

The config combines `@eslint/js` recommended, `typescript-eslint` recommended (syntax-only, no `projectService`), `eslint-plugin-boundaries` (layer and context rules resolved through `eslint-import-resolver-typescript`), `eslint-plugin-simple-import-sort`, `no-restricted-imports` for `../`, and Node globals for `.js`/`.mjs` scripts.

Aliases are declared once in `tsconfig.base.json` with the `${configDir}` template, so each extending project resolves `@contexts/*`, `@core/*` and `@shared/*` against its own `src/`.

Behaviour is proven with committed fixtures in `tests/lint-fixtures/` (globally ignored), linted by a `node:test` suite through the ESLint Node API with `ignore: false`. Fixes are computed in memory and never written to disk.

## Architecture Decisions

### Decision: One shared root flat config, root-only devDependencies

**Choice**: A single `eslint.config.js` at the root. All ESLint packages are root `devDependencies` with exact pins. Workspaces only declare `"lint": "eslint ."`.
**Alternatives considered**: (a) A `packages/eslint-config` workspace package that each app imports. (b) Per-workspace `eslint.config.js` files that re-export the root one.
**Rationale**: The repo has two workspaces and two lintable TS files today. A config package adds a build/publish surface and a dependency edge in every workspace for no current benefit. ESLint 9+ finds the nearest `eslint.config.js` walking up from the cwd, so the root file covers everyone, and the rules change in one place. Revisit when a workspace needs divergent rules (for example `apps/web` with React).

### Decision: Syntax-only typescript-eslint

**Choice**: `tseslint.configs.recommended` (non-type-checked) for `**/*.{ts,tsx,mts,cts}`. No `parserOptions.projectService`.
**Alternatives considered**: `recommendedTypeChecked` with `projectService`.
**Rationale**: `@typescript-eslint/no-explicit-any` is syntactic. Type-aware linting is explicitly out of scope. It would also need every linted file, including fixtures and root `.mjs`, to belong to a tsconfig program. That makes the setup slower and more fragile. It can be added later as its own story.

### Decision: Path-based boundaries elements with a captured context, adapters declared first

**Choice**: Element types are matched by folder pattern from the right side of the path (boundaries' default), so the same patterns work for `tests/lint-fixtures/src/...` now and `apps/*/src/...` later. `adapter` is declared before `infrastructure` because boundaries assigns the first matching descriptor.

| Element type | Pattern (mode `folder`) | Capture |
| --- | --- | --- |
| `adapter` | `contexts/*/infrastructure/adapters` | `context` |
| `domain` | `contexts/*/domain` | `context` |
| `application` | `contexts/*/application` | `context` |
| `infrastructure` | `contexts/*/infrastructure` | `context` |
| `transport` | `contexts/*/transport` | `context` |
| `core` | `core` | none |
| `shared` | `shared` | none |

Dependency rule (`default: 'disallow'`; "same" means `context` equals the importer's captured `context`):

| From | May import |
| --- | --- |
| `domain` | `domain` (same) |
| `application` | `application`, `domain` (same) |
| `infrastructure` | `infrastructure`, `adapter`, `application`, `domain` (same); `core`; `shared` |
| `adapter` | `adapter`, `infrastructure` (same); `application`, `domain` (any context); `core`; `shared` |
| `transport` | `transport`, `application`, `domain` (same); `core`; `shared` |
| `core` | `core`, `shared` |
| `shared` | `shared`, `core` |

**Alternatives considered**: (a) `basePattern` anchored at `src/`, which needs a different `root-path` per workspace and for fixtures. (b) A separate `layer` capture on one generic element. (c) Allowing `domain` to import `shared` or `core`.
**Rationale**: This follows the conventions' Layers table literally. Domain imports only domain plus the two `@house-radar/*` packages, which are external and not elements. Application imports domain. Infrastructure and transport point inward. Only `infrastructure/adapters` crosses contexts. The table does not mention `core` and `shared`, so they stay available to the outer layers only, which keeps domain and application framework-free. Packages are not elements, so `@house-radar/building-blocks` and `@house-radar/shared-kernel` never trigger the rule. The frontend `presentation` layer and the context-root `*.module.ts` are not modelled yet (see Open Questions).

Rule id and template syntax: use the canonical, non-deprecated dependency rule of the pinned major. In 5.x this is `boundaries/element-types` with `${from.context}`-style templates. If the pinned major renamed the rule or switched to another template syntax, use the new one. The test freezes the exact rule id after the version is pinned.

### Decision: TypeScript import resolver with explicit absolute tsconfig list

**Choice**: `settings['import/resolver'].typescript = { alwaysTryTypes: true, project: [<root>/tests/lint-fixtures/tsconfig.json, <root>/packages/*/tsconfig.json, <root>/apps/*/tsconfig.json] }`, where the absolute paths are built from `import.meta.dirname` in `eslint.config.js`.
**Alternatives considered**: (a) Relative `project` paths, which resolve against `process.cwd()` and differ between `eslint .` in a workspace, `lint:root` and the Node API test. (b) A root `tsconfig.json` with references. (c) Injecting the fixture tsconfig only from the test through `overrideConfig`, which depends on how flat config merges `settings`.
**Rationale**: Absolute paths make resolution independent of the cwd. Listing the fixture tsconfig in the shared config is a small, commented smell, accepted because the test must exercise the real config unchanged. If the resolver cannot resolve aliases, the AC1 alias fixture produces no boundaries error and the test fails. That rules out a vacuous pass.

### Decision: Aliases in `tsconfig.base.json` via `${configDir}`

**Choice**:

```json
"paths": {
  "@contexts/*": ["${configDir}/src/contexts/*"],
  "@core/*": ["${configDir}/src/core/*"],
  "@shared/*": ["${configDir}/src/shared/*"]
}
```

No `baseUrl`.
**Alternatives considered**: Declaring `paths` in each project tsconfig (fixture now, apps later).
**Rationale**: This was a user decision recorded in the proposal. TypeScript 5.5+ (repo pins 5.9.3) substitutes `${configDir}` with the directory of the extending tsconfig, so one declaration serves every backend and web app. The verification is behavioural: TypeScript resolves the alias in the building-blocks `tsc --noEmit` (unaffected, since no alias is used), and the resolver resolves it in the AC1 alias fixture. Fallback, if the resolver version does not expand `${configDir}`: keep the base `paths` for `tsc`, and add an equivalent relative `paths` block to `tests/lint-fixtures/tsconfig.json`. Disclose this in the apply report.

### Decision: `no-restricted-imports` with a regex pattern for `../`

**Choice**: `'no-restricted-imports': ['error', { patterns: [{ regex: '^\\.\\.(/|$)', message: 'Use an alias (@contexts/*, @core/*, @shared/*) instead of parent-relative imports.' }] }]`.
**Alternatives considered**: gitignore-style `group: ['../*', '../**']`, and `@typescript-eslint/no-restricted-imports`.
**Rationale**: The regex covers `..`, `../x` and `../../x` without the gitignore edge cases for relative paths. The base rule already sees TS `import type` declarations through the TS parser. Verify that the pinned ESLint supports `patterns[].regex`. If it does not, fall back to `group`, and the AC2 test catches the difference. Same-directory `./sub/x` imports into subfolders stay allowed, as in the proposal. The stricter "same directory only" reading of the conventions is deferred.

### Decision: simple-import-sort groups by longest match

**Choice**:

```js
groups: [
  ['^\\u0000'],                                         // side-effect imports
  ['^node:', `^(${builtinModules.join('|')})(/|$)`],   // Node built-ins
  ['^@?\\w'],                                           // external packages
  ['^@house-radar(/.*|$)'],                             // workspace packages
  ['^@(contexts|core|shared)(/.*|$)'],                  // internal aliases
  ['^\\.'],                                             // same-directory relative
]
```

`builtinModules` comes from `node:module`. `simple-import-sort/exports` is also `error`.
**Alternatives considered**: Ordering-based regexes that try to exclude `@house-radar` and aliases from the external group with negative lookaheads.
**Rationale**: simple-import-sort assigns each import to the group whose regex gives the longest match. `@house-radar/x` and `@contexts/x` match `^@?\w` for only two characters, while their dedicated regexes match the whole specifier. So they leave the generic scoped-external group without lookaheads, and the section order gives the documented sequence: built-ins, external, `@house-radar/*`, aliases, relative.

### Decision: Global ignores and file coverage

**Choice**: The first config object contains only `ignores`: `['**/dist/**', '**/.astro/**', '**/.turbo/**', '**/coverage/**', 'tests/lint-fixtures/**']`. TS files are opted in with `files: ['**/*.{ts,tsx,mts,cts}']`. `.js`/`.mjs`/`.cjs` are linted by default with `languageOptions.globals = globals.node`. `.astro` is not matched, so it is not linted.
**Alternatives considered**: Relying on `.gitignore` via `includeIgnoreFile`.
**Rationale**: `apps/docs/.astro/` and `apps/docs/dist/` contain generated `.mjs` and `.js` files that would fail. Explicit ignores are visible and testable. Node globals are needed because `@eslint/js` `no-undef` would flag `process` and `console` in `tests/workspace/support.mjs` and `apps/docs/scripts/*.mjs`. TS files get `no-undef` disabled by typescript-eslint's eslint-recommended override.

### Decision: Fixture-based behaviour tests through the ESLint Node API

**Choice**: `tests/workspace/lint.test.mjs` (`node:test`) creates `new ESLint({ cwd: repoRoot, ignore: false })` with the real root config. It runs `lintFiles` on individual fixture files and asserts the exact sorted list of `ruleId`s per file (`[]` for allowed cases). The fix check uses a second instance with `fix: (m) => m.ruleId?.startsWith('simple-import-sort/')`. It compares `result.output` with an inline expected string and never calls `ESLint.outputFixes`. A guard asserts that the default instance reports `isPathIgnored(fixture) === true`.
**Alternatives considered**: (a) Spawning the `eslint` CLI per rule, which is slower and asserts on text output. (b) `lintText` with a virtual `filePath`: boundaries resolves import targets on disk, so the cross-file cases need real files. (c) A committed `*.expected.ts` file, which would itself be a lintable fixture.
**Rationale**: The API is fast and deterministic, and it exposes structured `ruleId`s. Exact rule-id lists catch both missing errors and collateral noise (unused vars, parse errors with a `null` ruleId). The in-memory fix keeps the tree clean.

### Decision: Turbo lint cache keyed on the shared config

**Choice**: `"lint": { "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/eslint.config.js"], "outputs": [] }`. No `dependsOn`.
**Alternatives considered**: Adding `eslint.config.js` to `globalDependencies`, which would invalidate build, typecheck and test caches on every lint-rule edit.
**Rationale**: This scopes invalidation to `lint`. The repo's turbo 2.11.13 supports the `$TURBO_ROOT$` microsyntax. Lint needs no `^build`: boundaries only classifies local elements, and `@house-radar/*` imports are external. ESLint version bumps are root devDependencies. The apply step confirms with `turbo run lint --dry=json` that root external dependencies are part of the global hash. If they are not, also add `$TURBO_ROOT$/package.json` to `lint.inputs`.

### Decision: Package version selection at apply

**Choice**: Pin exact versions selected at apply time with `npm view <pkg> version peerDependencies engines --json`. Candidates: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-boundaries`, `eslint-plugin-simple-import-sort`, `eslint-import-resolver-typescript`, `globals`. Compatibility constraints:

1. Choose the highest ESLint major (candidates 10.x, then 9.x) that every plugin's `peerDependencies.eslint` range accepts.
2. `@eslint/js` uses the same version as `eslint`.
3. `typescript-eslint`'s `typescript` peer range must include 5.9.3.
4. Every `engines.node` must accept Node >= 24.
5. Use the latest version of `eslint-plugin-boundaries` within the chosen ESLint's peer range. Its rule id and template syntax then fix the test constants.
6. `eslint-import-resolver-typescript` must support the `project` array and `${configDir}`.

**Alternatives considered**: Caret ranges, or pinning versions in the design now.
**Rationale**: The repo pins exactly (see existing config assertions). Registry access was unavailable during exploration and design, so no version, peer range or `${configDir}` support claim in this document is verified. Record the selected versions and the `npm view` evidence in the apply report and the tasks document.

## Data Flow

```
pnpm lint ──→ turbo run lint ──→ (per workspace) pnpm run lint ──→ eslint .
                    │                                                  │
   inputs: $TURBO_DEFAULT$ + $TURBO_ROOT$/eslint.config.js             │ config lookup walks up
                                                                       ▼
pnpm lint:root ──→ eslint tests eslint.config.js ─────────────→ /eslint.config.js
                                                                       │
                   ignores ─ ts parser ─ rules ─ boundaries settings ──┤
                                                                       ▼
                          import/resolver typescript ──→ tsconfig (absolute list)
                                                             │ paths: ${configDir}/src/...
                                                             ▼
                                                   target file on disk ──→ element type + context

tests/workspace/lint.test.mjs ──→ new ESLint({ ignore:false }) ──→ lintFiles(fixture)
                                         └─→ messages[].ruleId  /  result.output (in memory)
```

## Fixture Layout

```
tests/lint-fixtures/
├── tsconfig.json                       # extends ../../tsconfig.base.json; include ["src/**/*.ts"]
└── src/
    ├── contexts/
    │   ├── listings/
    │   │   ├── domain/
    │   │   │   ├── listing.ts                          # clean target
    │   │   │   ├── same-dir-relative.ts                # OK: './listing'
    │   │   │   └── imports-infrastructure.ts           # AC1: @contexts/listings/infrastructure/listing-store
    │   │   ├── application/
    │   │   │   ├── uses-domain.ts                      # OK: @contexts/listings/domain/listing
    │   │   │   └── imports-other-context.ts            # boundaries: @contexts/pricing/application/price-quote
    │   │   └── infrastructure/
    │   │       ├── listing-store.ts                    # clean target
    │   │       └── adapters/pricing.adapter.ts         # OK: cross-context from adapters
    │   └── pricing/application/price-quote.ts          # clean target
    └── misc/                                           # not a boundaries element
        ├── plain-value.ts                              # clean target
        ├── nested/parent-relative.ts                   # AC2: '../plain-value'
        ├── explicit-any.ts                             # AC4: export type Loose = any;
        ├── unsorted-imports.ts                         # AC3: five groups shuffled
        └── sibling.ts                                  # relative target for AC3
```

Every fixture uses (re-exports) what it imports, so `@typescript-eslint/no-unused-vars` stays silent and each failing fixture reports exactly one rule id. `parent-relative.ts` sits one folder below its target (`misc/nested/parent-relative.ts` importing `../plain-value`), outside any element, so only `no-restricted-imports` fires. The unsorted fixture imports a built-in (`node:fs`), an external package (a bare specifier; it does not need to be installed because sorting is syntactic and boundaries ignores externals), `@house-radar/building-blocks/package-marker`, an alias and `./sibling`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `eslint.config.js` | Create | Shared flat config: global ignores, JS and TS blocks, Node globals, boundaries elements, rules and resolver settings, import sort groups, `no-restricted-imports`, `no-explicit-any` as `error` |
| `package.json` | Modify | Exact-pinned devDeps (7 packages); `"lint:root": "eslint tests eslint.config.js"` |
| `tsconfig.base.json` | Modify | `paths` for the three aliases via `${configDir}` |
| `turbo.json` | Modify | `lint.inputs` with `$TURBO_DEFAULT$` and `$TURBO_ROOT$/eslint.config.js` |
| `packages/building-blocks/package.json` | Modify | `"lint": "eslint ."` |
| `apps/docs/package.json` | Modify | `"lint": "eslint ."` (`.ts`/`.mjs` only through the config's file coverage) |
| `apps/docs/astro.config.mjs`, `apps/docs/src/content.config.ts` | Modify (if needed) | Import order fixed by a one-off `eslint --fix` so `pnpm lint` is green |
| `tests/lint-fixtures/tsconfig.json` | Create | Fixture project for alias resolution |
| `tests/lint-fixtures/src/**` | Create | Fixtures per the layout above (~12 tiny files) |
| `tests/workspace/lint.test.mjs` | Create | ESLint Node API behaviour tests |
| `tests/workspace/config.test.mjs` | Modify | Assertions for pins, scripts, turbo inputs, base `paths`, fixture tsconfig |
| `tests/workspace/turbo-cli.test.mjs` | Modify | Dry-run check that each workspace's `lint` task hashes `eslint.config.js` |
| `apps/docs/src/content/docs/architecture/conventions.md` | Modify | Tooling: `lint` is real, `lint:root`, rule set, aliases in base tsconfig |
| `apps/docs/src/content/docs/es/architecture/conventions.md` | Modify | ES mirror |
| `pnpm-lock.yaml` | Modify (generated) | Excluded from the line forecast |
| `openspec/config.yaml` | Modify (verify/archive) | `linter` commands per project |

## Interfaces / Contracts

Shape of `eslint.config.js` (illustrative, not final source):

```js
import { builtinModules } from 'node:module';
import { join } from 'node:path';

import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const root = import.meta.dirname;

export default [
  { ignores: ['**/dist/**', '**/.astro/**', '**/.turbo/**', '**/coverage/**', 'tests/lint-fixtures/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,            // or defineConfig()/tseslint.config() per pinned API
  { languageOptions: { globals: globals.node } },
  {
    plugins: { boundaries, 'simple-import-sort': simpleImportSort },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true, project: [
        join(root, 'tests/lint-fixtures/tsconfig.json'), // test fixtures only
        join(root, 'packages/*/tsconfig.json'),
        join(root, 'apps/*/tsconfig.json'),
      ] } },
      'boundaries/elements': [/* table above, adapter first */],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': ['error', { patterns: [{ regex: '^\\.\\.(/|$)', message: '…' }] }],
      'simple-import-sort/imports': ['error', { groups: [/* see decision */] }],
      'simple-import-sort/exports': 'error',
      'boundaries/element-types': ['error', { default: 'disallow', rules: [/* table above */] }],
    },
  },
];
```

Scripts contract: root `lint` = `turbo run lint` (unchanged); root `lint:root` = `eslint tests eslint.config.js`; workspace `lint` = `eslint .`.

Test contract (`lint.test.mjs`):

| Fixture | Expected sorted ruleIds |
| --- | --- |
| `contexts/listings/domain/imports-infrastructure.ts` | `[BOUNDARIES_RULE]` |
| `contexts/listings/application/imports-other-context.ts` | `[BOUNDARIES_RULE]` |
| `contexts/listings/domain/same-dir-relative.ts`, `application/uses-domain.ts`, `infrastructure/adapters/pricing.adapter.ts` | `[]` |
| `misc/nested/parent-relative.ts` | `['no-restricted-imports']` |
| `misc/explicit-any.ts` | `['@typescript-eslint/no-explicit-any']` |
| `misc/unsorted-imports.ts` (no fix) | `['simple-import-sort/imports']`; with fix, `output === EXPECTED_SORTED` and the file bytes on disk are unchanged |
| any fixture under the default instance | `isPathIgnored === true` |

`BOUNDARIES_RULE` is a single constant set to the pinned plugin's canonical rule id.

## Testing Strategy

Strict TDD (`openspec/config.yaml strict_tdd: true`). The runner is `pnpm test:workspace` (`node --test --test-concurrency=1 'tests/workspace/*.test.mjs'`).

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Config (unit-like) | Exact pins of the 7 devDeps (`^\d+\.\d+\.\d+$`, `eslint` equals `@eslint/js`); `lint:root`; workspace `lint` scripts (update the existing `deepEqual` on building-blocks scripts and the docs characterization test); `turbo.tasks.lint.inputs`; base `paths`; fixture tsconfig `extends` | Extend `config.test.mjs`. RED: assertions fail on the current tree |
| Lint behaviour (integration) | AC1–AC4, allowed cases, fixture ignore guard | `lint.test.mjs` through the ESLint Node API. RED, in order: first `eslint` is not installed (import fails); after deps and a minimal ignores-only config, the rule-id assertions fail because the rules are absent; GREEN once the full config lands |
| Turbo wiring | `lint` hash inputs include `eslint.config.js` for `docs` and `@house-radar/building-blocks` | `turbo-cli.test.mjs` `--dry=json` (verify the dry-run field that lists inputs at apply) |
| Manual / verify | `pnpm lint` and `pnpm lint:root` exit 0; `pnpm test`, `pnpm test:workspace`, `pnpm docs:check-i18n`, `pnpm docs:build`; `git status` clean after tests | Commands in verify |

## Threat Matrix

N/A: there is no routing, subprocess, VCS/PR automation, executable-file classification or process-integration boundary. The change adds static npm scripts and lint configuration. The new test uses the in-process ESLint Node API, and the existing turbo dry-run helper is reused unchanged.

## Migration / Rollout

No migration required. Additive tooling. A one-off `eslint --fix` may reorder imports in the two existing docs files. Under auto-chain, if the forecast (~300–420 authored lines) exceeds 400, split into:

- **Slice 1**: deps, `eslint.config.js`, aliases, scripts, turbo inputs, config assertions, existing-file fixes.
- **Slice 2**: fixtures, `lint.test.mjs`, turbo dry-run check, docs EN/ES.

Rollback: `git revert` the slice commits, then `pnpm install`.

## Open Questions

- [ ] (Non-blocking) `presentation` layer for `apps/web` and the context-root `*.module.ts` are not boundaries elements yet. Imports from or to them are unchecked. Add them in the web or api scaffolding stories, possibly with `boundaries/no-unknown`.
- [ ] (Non-blocking) Should `application` be allowed to import `shared` (Nest CQRS pieces)? The design follows the Layers table strictly (no), pending the first real handler.
- [ ] (Verify at apply) pnpm exposes the root `node_modules/.bin/eslint` to workspace scripts. If it does not, add `eslint` with the same exact pin as a devDependency of each workspace.
- [ ] (Verify at apply) ESLint major, plugin peer ranges, boundaries rule id and template syntax, resolver `${configDir}` support, `no-restricted-imports` `regex` support, and the turbo dry-run input field. Fallbacks are defined above for each.
