# Archive Report: m0-prettier-husky-commitlint (S-M0-03)

**Change**: `m0-prettier-husky-commitlint` (GitHub issue #18)
**Archived**: 2026-11-21
**Artifact store**: hybrid (openspec files + Engram `sdd/m0-prettier-husky-commitlint/archive-report`)
**Project**: house-radar

## Final State at Close

Final-state facts come from the orchestrator launch prompt (rank 2). They outrank the `apply-progress` snapshot (rank 3), which is cited only for history.

- Tasks: 45/45 checked in `tasks.md` (rank 1: 45 `[x]`, 0 `[ ]`). Engram tasks mirror #1846 reports 46 tasks; the canonical file has 45, and the file is authoritative. Tasks 6.2 and 6.3 were ticked during this archive step (see Notes).
- Integration: stacked PRs to `main`. PR #144 (OpenSpec artifacts `1727e3d`, C1 `095d710` prettier config, C1b `fdf1f80` ignore `apps/docs/design/`, C2 `dcdc81f` reformat) and PR #145 (C3 `67e2dc8` commitlint, C4 `b7d7ed3` husky, lint-staged and `test:changed`, C5 `0530b05` docs EN/ES). Both merged. `main` head `4c7c628`. Issue #18 closed.
- Pinned toolchain (launch prompt): prettier 3.10.1, husky 9.1.7, lint-staged 17.6.1, `@commitlint/cli` and `@commitlint/config-conventional` 21.2.4.
- Checks green at C5 (launch prompt, observed at that commit): `pnpm lint`, `pnpm lint:root`, `pnpm typecheck`, `pnpm test`, `pnpm test:workspace` (55/55), `pnpm format:check`, `pnpm docs:check-i18n`, `pnpm docs:build`, `TURBO_SCM_BASE=main pnpm test:changed`. The pre-push hook ran on push (4/4 tasks, FULL TURBO).
- The apply-progress snapshot (#1847) stopped at C4 and reports a running count of about 453 lines including `tasks.md` ticks. It is superseded for test counts and commit state by the launch prompt facts above.
- No `verify-report` exists. Verify was optional and was not produced. This archive does not claim a separate verification verdict beyond the checks listed above.

## Deviations and Decisions

Recorded in the launch prompt and `apply-progress` (history):

- `apps/docs/design/` added to `.prettierignore` (approved by the user).
- `turbo run build test --affected` exits 1 without a resolvable base ref. The user kept `test:changed` unchanged (task 4.11, option a) and documented the `TURBO_SCM_BASE=<ref>` override. The `turbo test` task pins `TURBO_SCM_BASE=main`.
- Delivery: auto-chain with `stacked-to-main` (the running count exceeded 400 lines after C2). PR 1 = C1, C1b, C2; PR 2 = C3, C4, C5 stacked on PR 1.
- `openspec/config.yaml` was updated in this archive step, following the prior change's pattern: `formatter: "pnpm format:check"` for `apps/docs` and `packages/building-blocks` (replacing `null`), and `format_commands: ["pnpm format:check"]` in `testing` (mirroring `lint_commands`).

## Known Gaps (Unresolved)

Reported by the orchestrator launch prompt. Not reclassified here.

- A rejected commit-msg was not exercised through a real `git commit`. Coverage is by commitlint behaviour tests (`tests/workspace/formatting-hooks.test.mjs`).
- Some C4 husky and ESLint tests were green immediately, because the pins were installed before the tests were written. This means those tests did not observe a RED state. The launch prompt records this as a gap.
- Native review: the user declined the RDD review for both committed-range candidates. An earlier WIP review was abandoned. No review receipt exists for this change.

## Follow-ups (Unresolved)

None recorded in the change artifacts beyond the known gaps above.

## Unfinished Work

None observed in `tasks.md` (0 unchecked).

## Engram Observations Located (Traceability)

Observation IDs were located with `mem_search` on the topic key prefix. Only the file artifacts were used as source material. The Engram observations were not read in full during this archive step, so they are listed for traceability only. Files are the canonical copies; Engram observations are mirrors.

| Artifact | Topic key | Observation ID | Use in this archive |
| --- | --- | --- | --- |
| explore | `sdd/m0-prettier-husky-commitlint/explore` | 1842 | History only |
| proposal | `sdd/m0-prettier-husky-commitlint/proposal` | 1843 | Mirror; source of record is file `proposal.md` |
| spec | `sdd/m0-prettier-husky-commitlint/spec` | 1844 | Mirror; source of record is files `specs/*/spec.md` |
| design | `sdd/m0-prettier-husky-commitlint/design` | 1845 | Mirror; source of record is file `design.md` |
| tasks | `sdd/m0-prettier-husky-commitlint/tasks` | 1846 | Mirror of an earlier revision; completion state from file `tasks.md` (rank 1) |
| apply-progress | `sdd/m0-prettier-husky-commitlint/apply-progress` | 1847 | Intermediate snapshot (rank 3), stops at C4, history only |
| verify-report | `sdd/m0-prettier-husky-commitlint/verify-report` | none | Not present (verify not produced) |

## Specs Synced

| Domain | Action | Details |
| --- | --- | --- |
| `workspace-formatting-and-hooks` | Created | New capability. Main spec did not exist. Delta copied mechanically as the full spec (`cp` + `diff -r`, empty). |
| `workspace-task-pipeline` | Updated | Composed with `gentle-ai sdd-archive-compose` (exit 0). 2 MODIFIED requirements applied (Root scripts delegate to Turborepo, Pinned toolchain). No ADDED, REMOVED or RENAMED sections. All 10 existing requirements remain; unrelated requirements preserved. |

Main specs: `openspec/specs/workspace-formatting-and-hooks/spec.md`, `openspec/specs/workspace-task-pipeline/spec.md`.

## Archive Contents

- `proposal.md`: present
- `design.md`: present
- `explore.md`: present
- `specs/workspace-formatting-and-hooks/spec.md`: present
- `specs/workspace-task-pipeline/spec.md`: present
- `tasks.md`: present, 45/45 complete, 0 unfinished

Archive path: `openspec/changes/archive/2026-11-21-m0-prettier-husky-commitlint/`.

## Mechanical Readback (Verbatim)

- New capability copy (`openspec/changes/m0-prettier-husky-commitlint/specs/workspace-formatting-and-hooks/spec.md` to `openspec/specs/workspace-formatting-and-hooks/spec.md`): `diff -r` produced no output, status 0 (checked before and after the `mv` from the temp file).
- Spec composition (`openspec/changes/m0-prettier-husky-commitlint/specs/workspace-task-pipeline/spec.md` into `openspec/specs/workspace-task-pipeline/spec.md`): `gentle-ai sdd-archive-compose --canonical ... --delta ... --output ...spec.md.compose-tmp` exited 0, then `mv` to the main spec. Composition is evidenced by the zero exit, not by `diff -r`.
- Archive move (`openspec/changes/m0-prettier-husky-commitlint` to `openspec/changes/archive/2026-11-21-m0-prettier-husky-commitlint`, via `git mv`): `diff -r` against the pre-move snapshot produced no output, status 0 (`DIFF_EMPTY status=0`). The source directory is absent after the move. `archive-report.md` was added after the readback and is excluded from the comparison.
- Edits made before the move (inside the change folder): `tasks.md` items 6.2 and 6.3 changed from `[ ]` to `[x]`. Edits outside the change folder: `openspec/config.yaml`.

## Notes

- Renames are staged by `git mv`. The archive is intended as one commit: `chore(openspec): archive m0-prettier-husky-commitlint`. The orchestrator commits and opens the PR. Nothing was committed or pushed by this archive step.
- Engram `sdd/m0-prettier-husky-commitlint/archive-report` is written from this file.
