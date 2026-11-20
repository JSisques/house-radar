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

## Pending discovery

- Planning depth (which milestones are sliced now).
- Docs output (roadmap page en + es).
