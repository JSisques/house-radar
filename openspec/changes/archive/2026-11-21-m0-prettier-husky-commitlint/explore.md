# Exploration: Prettier, husky, lint-staged and commitlint (S-M0-03)

Source: GitHub issue #18 (S-M0-03, parent #3, depends on #17). Mirrored from Engram `sdd/m0-prettier-husky-commitlint/explore` (observation #1842); the explore run could not write files.

## Findings

- `eslint.config.js` has no stylistic rules, so `eslint-config-prettier` is not required (optional).
- Prettier and husky are not installed. The repo-wide format state is unmeasured (no shell during explore).
- Code already uses lines up to ~110 characters, so the default `printWidth` of 80 would reformat many files.
- Markdown tables use the compact `| --- |` style and would be realigned by Prettier, so `*.md`, `openspec/`, `odd/`, `tests/lint-fixtures/` and the lockfile should be ignored.
- `test:changed` can be `turbo run test --affected`: the default base is `main...HEAD`, overridable with `TURBO_SCM_BASE`. A shallow checkout selects all packages. Root-only changes select nothing, except files in `globalDependencies` (`tsconfig.base.json`).
- The workspace suite (`tests/workspace`) is not covered by `turbo run test`.
- lint-staged: run `eslint --fix --no-warn-ignored`, then `prettier --write`; config under the `lint-staged` key in `package.json`.
- Husky v9: `"prepare": "husky"`; hook files have no shebang.
- Testing via `node --test`: config and file assertions, commitlint driven through stdin with `spawnSync`, Prettier checked with `--stdin-filepath`.
- Pin exact versions (existing convention, no `^`).

## Forecast

About 250–350 authored changed lines excluding the lockfile. Fits the 400-line budget if any reformat is scoped by `.prettierignore` or kept out of the slice.

## Open decisions (at explore time)

- `printWidth` (the issue only specifies `singleQuote` and `trailingComma`).
- Whether to mass-reformat now.
- `format:check` scope.
- Whether pre-push also runs `test:workspace`.
- Behaviour of `--affected` when no local `main` exists (unverified).

All of these were resolved by the user or the orchestrator before the proposal; see `proposal.md`.
