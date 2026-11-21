# Archive Report: m0-turborepo-workspace (S-M0-01)

**Change**: `m0-turborepo-workspace` (GitHub issue #16)
**Archived**: 2026-11-21
**Artifact store**: hybrid (openspec files + Engram `sdd/m0-turborepo-workspace/archive-report`)
**Project**: house-radar

## Final State at Close

Final-state facts come from the orchestrator launch prompt (rank 2). They outrank the `apply-progress` snapshot (rank 3), which is cited only for history.

- Tasks: 16/16 complete (`tasks.md`, rank 1: 16 checked, 0 unchecked).
- Work-unit commits:
  - WU-1 `c2cd6a1`: feat, turborepo task pipeline, strict base tsconfig, building-blocks, config tests.
  - WU-2 `802e1a8`: test, CLI behaviour tests.
  - WU-3 `ef89794`: docs, conventions EN and ES.
- Integration: merged to `main` via PR #138 as merge commit `bb1d09c` on 2026-11-21. Issue #16 closed.
- Verification at close (launch prompt, observed):
  - `pnpm test:workspace`: 14/14 pass, about 6 s. This supersedes the earlier "14 tests ~4 s" in `apply-progress` (1830, written during apply).
  - `pnpm turbo run build typecheck`: second run FULL TURBO.
  - `docs:test`, `docs:check`, `docs:check-i18n`, `docs:build`: pass.
  - `turbo run build typecheck test lint`: 6/6 successful.
- No `verify-report` exists. Verify was skipped by the user. This archive does not claim a verification verdict.

## Deviations and Decisions

- Vitest is pinned to 5.1.1. The design said 4.x. Recorded as a deviation from the design, confirmed by `apply-progress` (1830) and the launch prompt.
- `moduleResolution: Bundler` was confirmed by the user.
- The `@` alias-resolving build tool is deferred to S-M0-02. `tsc` remains the build tool for now.

## Follow-ups (Unresolved)

- `.github/workflows/docs.yml` path filters ignore `turbo.json` and `tsconfig.base.json`. This is a CI gap, not fixed in this change.
- Alias build step is deferred to S-M0-02.

## Unfinished Work

None observed. All 16 tasks are checked.

## Engram Observations Read (Traceability)

| Artifact | Topic key | Observation ID | Use in this archive |
| --- | --- | --- | --- |
| explore | `sdd/m0-turborepo-workspace/explore` | 1823 | History only |
| decision (Vitest from day one) | `sdd/m0-turborepo-workspace/decisions` | 1824 | Context |
| proposal | `sdd/m0-turborepo-workspace/proposal` | 1825 | Source of record: file `proposal.md` |
| spec | `sdd/m0-turborepo-workspace/spec` | 1826 | Source of record: file `specs/workspace-task-pipeline/spec.md` |
| design | `sdd/m0-turborepo-workspace/design` | 1827 | Source of record: file `design.md` |
| tasks | `sdd/m0-turborepo-workspace/tasks` | 1829 | Completion state (rank 1, file `tasks.md`) |
| apply-progress | `sdd/m0-turborepo-workspace/apply-progress` | 1830 | Intermediate snapshot (rank 3), history only |
| verify-report | `sdd/m0-turborepo-workspace/verify-report` | none | Not present (verify skipped) |

Files are the canonical artifact copies. Engram observations are mirrors. Observations 1823, 1825, 1826, 1827, 1829 and 1830 were read with `mem_get_observation` (1825 and 1827 via their file-path locators).

## Specs Synced

| Domain | Action | Details |
| --- | --- | --- |
| `workspace-task-pipeline` | Created | New capability. Main spec did not exist. Delta copied mechanically as the full spec (8 ADDED requirements). |

Main spec: `openspec/specs/workspace-task-pipeline/spec.md`.

## Archive Contents

- `proposal.md`: present
- `explore.md`: present
- `design.md`: present
- `specs/workspace-task-pipeline/spec.md`: present
- `tasks.md`: present, 16/16 complete, 0 unfinished

Archive path: `openspec/changes/archive/2026-11-21-m0-turborepo-workspace/`.

## Config Update

`openspec/config.yaml` test info was stale, so it was updated in this archive:

- `strict_tdd_note` now names `pnpm test` (turbo) and `pnpm test:workspace`.
- `packages/building-blocks` project entry is no longer "planned", and now lists its test, typecheck and build commands.
- `testing.workspace_test_command` is `pnpm test`. `testing.workspace_suite_command` is `pnpm test:workspace`. Layers updated.
- `rules.verify` includes `pnpm test` and `pnpm test:workspace`, and keeps the docs commands.

Not updated (out of scope): the `context` header (lines 4-6) still describes building-blocks as planned.

## Mechanical Readback (Verbatim)

Spec sync (`openspec/changes/m0-turborepo-workspace/specs/workspace-task-pipeline/spec.md` to `openspec/specs/workspace-task-pipeline/spec.md`): empty `diff -r`, status 0.

Archive move (`openspec/changes/m0-turborepo-workspace` to `openspec/changes/archive/2026-11-21-m0-turborepo-workspace`, via `git mv`): empty `diff -r` against the pre-move snapshot, status 0. The source directory is absent after the move. `archive-report.md` was added after the readback and is excluded from the comparison.

## Notes

- Renames are staged by `git mv`. The new main spec and the `config.yaml` edit are not staged. The orchestrator commits.
