# Archive Report: m0-eslint-flat-config (S-M0-02)

**Change**: `m0-eslint-flat-config` (GitHub issue #17)
**Archived**: 2026-11-21
**Artifact store**: hybrid (openspec files + Engram `sdd/m0-eslint-flat-config/archive-report`)
**Project**: house-radar

## Final State at Close

Final-state facts come from the orchestrator launch prompt (rank 2). They outrank the `apply-progress` snapshot (rank 3), which is cited only for history.

- Tasks: 32/32 complete (`tasks.md`, rank 1: 32 checked, 0 unchecked).
- Integration: PR #140 (PR 1, tooling, config and rule tests) and PR #141 (PR 2, aliases, turbo dry-run, docs) merged to `main`. Main head `e7d3bbf`. Issue #17 closed.
- Commit after the apply-progress snapshot: `fb36c86` `test(lint): prove allowed alias imports resolve instead of passing vacuously`. The "allowed alias imports" case also lints the same source from a forbidden layer and expects `boundaries/dependencies`. RED was observed by breaking `@contexts/*` in `tsconfig.base.json`; GREEN after restore.
- Verification at PR 2 head (launch prompt, observed): `pnpm install --frozen-lockfile`, `pnpm test:workspace` (33/33 pass), `pnpm lint`, `pnpm lint:root`, `pnpm test`, `pnpm typecheck`, `pnpm docs:check-i18n`, `pnpm docs:build`, all exit 0. This supersedes any earlier count in `apply-progress` (1838).
- Pinned toolchain (launch prompt, PR 1): eslint 10.15.0, @eslint/js 10.0.1, typescript-eslint 8.73.0, eslint-plugin-boundaries 7.4.4 (rule id `boundaries/dependencies`), eslint-plugin-simple-import-sort 14.0.0, eslint-import-resolver-typescript 4.4.5, globals 17.14.0.
- No `verify-report` exists. Verify was optional and not produced. This archive does not claim a separate verification verdict beyond the observed checks listed above.

## Deviations and Decisions

Recorded in the launch prompt as deviations from `design.md`:

- Root `package.json` declares `"type": "module"`.
- `@eslint/js` is pinned to the same major as `eslint` only (10.x), not an identical version.
- `@typescript-eslint/no-explicit-any` is scoped to TypeScript files.
- No fallbacks were needed beyond the design (`${configDir}` expansion and resolver behaviour verified at apply, per `apply-progress` 1838).
- `openspec/config.yaml` was updated in PR 2 (`linter` and `lint_commands`).

## Follow-ups (Unresolved)

None recorded in the change artifacts. The design's "Open" items (presentation layer and `*.module.ts` not modelled as boundary elements; `application -> shared` dependency disallowed pending a decision; pnpm root `.bin` availability on workspace PATH) were not reclassified by the launch prompt and remain as written in `design.md`.

## Unfinished Work

None observed. All 32 tasks are checked in `tasks.md`.

## Engram Observations Read (Traceability)

| Artifact | Topic key | Observation ID | Use in this archive |
| --- | --- | --- | --- |
| explore | `sdd/m0-eslint-flat-config/explore` | 1833 | History only, not read in full |
| proposal | `sdd/m0-eslint-flat-config/proposal` | 1834 | Mirror; source of record is file `proposal.md` |
| spec | `sdd/m0-eslint-flat-config/spec` | 1835 | Mirror; source of record is files `specs/*/spec.md` |
| design | `sdd/m0-eslint-flat-config/design` | 1836 | Mirror; source of record is file `design.md` |
| tasks | `sdd/m0-eslint-flat-config/tasks` | 1837 | Mirror of revision 2; completion state from file `tasks.md` (rank 1) |
| apply-progress | `sdd/m0-eslint-flat-config/apply-progress` | 1838 | Intermediate snapshot (rank 3), history only |
| verify-report | `sdd/m0-eslint-flat-config/verify-report` | none | Not present (verify not produced) |

Files are the canonical artifact copies. Engram observations are mirrors. Observations 1834, 1835, 1836, 1837 and 1838 were read with `mem_get_observation`.

## Specs Synced

| Domain | Action | Details |
| --- | --- | --- |
| `workspace-task-pipeline` | Updated | Composed with `gentle-ai sdd-archive-compose` (exit 0). 4 MODIFIED requirements applied (Root scripts delegate to Turborepo, Pinned toolchain, Task graph and caching, Strict shared TypeScript baseline). REMOVED section contained no whole-requirement removals. All 10 existing requirements remain; unrelated requirements preserved. |
| `workspace-linting` | Created | New capability. Main spec did not exist. Delta copied mechanically as the full spec (14 ADDED requirements). |

Main specs: `openspec/specs/workspace-task-pipeline/spec.md`, `openspec/specs/workspace-linting/spec.md`.

## Archive Contents

- `proposal.md`: present
- `design.md`: present
- `specs/workspace-linting/spec.md`: present
- `specs/workspace-task-pipeline/spec.md`: present
- `tasks.md`: present, 32/32 complete, 0 unfinished

Archive path: `openspec/changes/archive/2026-11-21-m0-eslint-flat-config/`.

## Mechanical Readback (Verbatim)

- Spec composition (`openspec/changes/m0-eslint-flat-config/specs/workspace-task-pipeline/spec.md` into `openspec/specs/workspace-task-pipeline/spec.md`): `gentle-ai sdd-archive-compose --canonical ... --delta ... --output ...spec.md.compose-tmp` exited 0, then `mv` to the main spec.
- New capability copy (`openspec/changes/m0-eslint-flat-config/specs/workspace-linting/spec.md` to `openspec/specs/workspace-linting/spec.md`): `diff -r` produced no output, status 0.
- Archive move (`openspec/changes/m0-eslint-flat-config` to `openspec/changes/archive/2026-11-21-m0-eslint-flat-config`, via `git mv`): `diff -r` against the pre-move snapshot produced no output, status 0. The source directory is absent after the move. `archive-report.md` was added after the readback and is excluded from the comparison.

## Notes

- Renames are staged by `git mv`. The archive is committed as one commit: `chore(openspec): archive m0-eslint-flat-config`. Push and PR are not performed.
