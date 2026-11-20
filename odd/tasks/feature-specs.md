# Feature: feature-specs

## Objective

Turn HR-F001…HR-F012 into detailed functional specifications (business rules, Given/When/Then acceptance criteria, edge cases, responsible module, dependencies) and record the product decisions taken during discovery as ADRs D17–D21.

## Problem / Why

Feature pages currently only list requirements copied from the draft; acceptance criteria, responsible module and dependencies are "To be defined". They must be precise enough to become GitHub issues and drive strict TDD.

## Decisions taken in discovery (2026-11-20, user-approved)

- **D17 Manual import:** assisted form. The URL is stored as provenance and link to the original; all data is entered by hand. No content is extracted from the page. Price updates are manual too.
- **D18 Location:** pin on a map with declared precision (`exact` / `approximate` / `municipality`). Municipality and province are derived from the pin via PostGIS point-in-polygon against official IGN open boundaries. Postal code is entered by hand. Geocoding is deferred (future adapter, D10).
- **D19 Search read model:** search results are Properties, not Listings. Representative price = lowest price among the property's ACTIVE listings ("N listings, from X €").
- **D20 Listing consolidation rules:**
  1. Conflicting attribute values across listings: the property shows the most recent observed value and flags the conflict, showing each value with its source.
  2. Price history is stored per listing; the property shows the evolution of its lowest active price.
  3. Manual "check listing" action records a new observation: price (changed or not), still-active status, check date.
  4. Disappeared: manual sources → marked by the user; automatic sources → not seen in N consecutive runs (configurable, default 3).
  5. Price per m² uses built area only; if missing it is unknown (never silently falls back to usable area).
  6. Statistics are computed over active properties and always state sample size and provenance.
- **D21 Duplicate detection:** system suggests, never merges automatically. Candidate when: same source + same external ID, OR distance < 100 m AND built area within ±5 % AND same number of bedrooms. Thresholds configurable. User resolves: "same property" (link) or "different property" (dismiss, remembered).

## Scope

- ADRs D17–D21 (en + es) and ADR index update.
- Domain page update (new concepts: observation, location precision, representative price, attribute conflict, duplicate candidate).
- Rewrite of the 12 feature pages (en + es) with the template below.

Out of scope: application code, GitHub issues creation, `apps/docs/reference/` (historical draft, not modified).

## Feature page template

Front matter unchanged in shape. Sections: Summary; Priority; Responsible module(s) (`apps/api` bounded context, `apps/web`, `apps/ingestion`, `packages/domain`, `infra`); Dependencies (HR-Fxxx and ADRs); User stories; Business rules (numbered, IDs like `HR-F005-BR1`); Acceptance criteria (Given/When/Then, IDs like `HR-F005-AC1`); Edge cases; Out of scope (MVP); Related decisions (ADR links).

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | ADRs D17–D21 + ADR index (en + es) | delegated (writer trigger: 2+ files) | [x] | |
| T2 | Domain page update (en + es) | delegated | [x] | |
| T3 | HR-F001 ingestion, HR-F002 normalization (en + es) | delegated | [ ] | |
| T4 | HR-F003 search, HR-F004 detail, HR-F005 duplicates, HR-F008 price history (en + es) | delegated | [ ] | |
| T5 | HR-F006 map, HR-F007 favorites & saved searches, HR-F009 dashboard (en + es) | delegated | [ ] | |
| T6 | HR-F010 users, HR-F011 notifications, HR-F012 admin & observability (en + es); features index update | delegated | [ ] | |

## Acceptance criteria

- No feature page contains "To be defined" for module, dependencies or acceptance criteria.
- Every rule from D17–D21 appears in at least one feature's business rules.
- `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build` pass.

## Checks

TDD (D14) applies to production code; this is documentation content, verified by the checks above.

## Progress / Evidence

- Branch `docs/feature-specs` created from `main` (6f28a98).
- T1 done: ADRs D17-D21 (en + es) and index updated.
- T2 done: domain page (en + es) extended.

## Next step

T3.
