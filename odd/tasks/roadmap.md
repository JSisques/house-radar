# Feature: roadmap

## Objective

Turn the detailed features (HR-F001…HR-F012) and the technical foundation into an ordered roadmap: GitHub milestones and issues, plus a roadmap page in the docs portal (en + es).

## Decisions taken (user-approved)

### R1. Milestones (2026-11-20)

Ordered by dependency and risk, not by feature number.

| Milestone | Goal | Scope |
|---|---|---|
| M0 · Foundation | Monorepo ready to write code with TDD | Tooling (Turborepo, ESLint, Prettier, commitlint, husky), `building-blocks`, `shared-kernel`, `api`/`web`/`ingestion` skeletons, Docker Compose (Postgres + PostGIS, Redis), outbox + relay, observability baseline |
| M1 · Walking skeleton | Cross every layer with one real flow | Manual import (assisted form) → `Listing` + `Observation` → `Property` 1:1 → detail page → basic list. HR-F001 (manual part), HR-F002, HR-F004 (basic) |
| M2 · Search & map | The real search | `geography` (IGN import), all filters, typed URL, MapLibre map with clustering. HR-F003, HR-F006 |
| M3 · History & duplicates | The differentiating value | Check listing, history and chart, disappeared listings, duplicate candidates and resolution. HR-F005, HR-F008 |
| M4 · Users | Complete personal product | Auth with seeded account, favorites, saved searches, preferences. HR-F007, HR-F010 |
| M5 · Automated ingestion | Data without manual work | idealista connector (if the key was granted), runs, retries, automatic disappearance, ingestion panel and alerts. HR-F001 (automatic), HR-F012 |
| M6 · Dashboard → Release 1.0 | Close the MVP | Statistics and dashboard; acceptance criteria of the product scope. HR-F009 |

Notes:

- M0 is large on purpose: without `building-blocks`, the outbox and CI boundary checks, the first aggregate would be written without the agreed rules.
- M1 comes before the full search: if the end-to-end skeleton breaks, it breaks on one flow, not on twenty filters.
- Authentication is in M4; until then the app runs locally only. Nothing is exposed on the server without authentication.
- HR-F011 (notifications, P2) is outside release 1.0.

### R2. Issue granularity (2026-11-20)

- One issue per vertical slice (user decision): a deliverable piece of about 400 authored lines with its own acceptance criteria taken from `HR-FNNN-ACn`, built with strict TDD, delivered as one reviewable PR.
- Each feature is a parent issue; its slices are linked sub-issues.
- Labels: context/app (`ctx:<context>`, `app:<app>`, `pkg:<package>`), type (`feature`, `foundation`, `docs`), priority (`P0`–`P2`). A GitHub Project board tracks the flow.

### R3. Planning depth (2026-11-20)

- Everything is sliced now (user decision): all seven milestones get their vertical-slice issues, plus one parent issue per feature and one for the foundation. HR-F011 (P2, post-1.0) gets a parent issue without milestone.
- The user authorized creating milestones, labels, a GitHub Project board and the issues in the public repository.
- Process: (1) draft the full issue plan in `odd/tasks/roadmap-issues.md` (reviewable, versioned); (2) create everything in GitHub from that plan; (3) record created numbers back in the plan.

### R4. Versioning model (2026-11-20)

- One product version for the whole monorepo (user decision): `api`, `web`, `ingestion` and `docs` are released together under a single SemVer number and tag (e.g. `v1.4.0`), matching the deployment model (one Docker Compose stack, D8).
- Internal packages (`building-blocks`, `shared-kernel`) are `private` and follow the product version; if one is ever published to npm, it can switch to an independent version without affecting the rest.
- Versioning and releases belong to M0 · Foundation.
- Rejected: independent versions per app/package (cross-version compatibility overhead without independent deployments or npm publishing).

### R5. Release tooling (2026-11-20)

- release-please (GitHub Action), single root package (user decision). On every merge to `main` it maintains a Release PR accumulating the changelog and the next version computed from Conventional Commits (`fix` → patch, `feat` → minor, breaking → major). Merging the Release PR creates the tag, the GitHub Release and updates `CHANGELOG.md`: version and changelog are automatic, publishing is a human decision.
- `0.x` versions until M6; `1.0.0` coincides with Release 1.0. Before 1.0, breaking changes bump the minor (`bump-minor-pre-major`).
- Docker images tagged with the product version and the commit SHA, so the server deploys an exact version and can roll back.
- Rejected: semantic-release (publishes on every qualifying push, no human gate); Changesets (per-PR changeset files, npm-oriented, redundant with Conventional Commits).
- To be documented as ADR D33 with the roadmap docs output.

## Pending discovery

- None for the issue plan. Docs output: roadmap page (en + es) and ADR D33.
- Docs output (roadmap page en + es).
