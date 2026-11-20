---
title: Roadmap
description: Milestones M0 to M6 toward Release 1.0, ordering rationale, issue model and links to the GitHub board and parent issues.
sidebar:
  order: 6
---

The roadmap turns the features [HR-F001 to HR-F012](/features/) and the technical foundation into seven ordered milestones. The first release, 1.0.0, closes the [MVP scope](/product/mvp-scope/). Versioning and releases follow [D33](/adr/d33-versioning-and-releases/): `0.x` until M6, then `1.0.0`.

- Project board: [GitHub project](https://github.com/users/JSisques/projects/16)
- Milestones: [GitHub milestones](https://github.com/JSisques/house-radar/milestones)

## Milestones

| Milestone | Goal | Scope | Features |
| --- | --- | --- | --- |
| M0 · Foundation | Monorepo ready to write code with TDD | Tooling (Turborepo, ESLint, Prettier, commitlint, husky), `building-blocks`, `shared-kernel`, `api`/`web`/`ingestion` skeletons, Docker Compose (Postgres + PostGIS, Redis), outbox and relay, observability baseline, release tooling | Foundation ([D2](/adr/d02-repository-strategy/), [D16](/adr/d16-quality-and-workflow/), [D24](/adr/d24-own-building-blocks/), [D31](/adr/d31-transactional-outbox/), [D33](/adr/d33-versioning-and-releases/)) |
| M1 · Walking skeleton | Cross every layer with one real flow | Manual import (assisted form), `Listing` and `Observation`, `Property` 1:1, detail page, basic list | [HR-F001](/features/hr-f001-ingestion/) (manual part), [HR-F002](/features/hr-f002-normalization/), [HR-F004](/features/hr-f004-property-detail/) (basic) |
| M2 · Search & map | The real search | `geography` (IGN import), all filters, typed URL, MapLibre map with clustering | [HR-F003](/features/hr-f003-search/), [HR-F006](/features/hr-f006-map/) |
| M3 · History & duplicates | The differentiating value | Check listing, history and chart, disappeared listings, duplicate candidates and resolution | [HR-F005](/features/hr-f005-duplicates/), [HR-F008](/features/hr-f008-price-history/) |
| M4 · Users | Complete personal product, running on a disposable staging server | Authentication with a seeded account, favorites, saved searches, preferences; staging deployment with Docker Compose | [HR-F007](/features/hr-f007-favorites-saved-searches/), [HR-F010](/features/hr-f010-users/) |
| M5 · Automated ingestion | Data without manual work | idealista connector (if the key was granted), runs, retries, automatic disappearance, ingestion panel and alerts | [HR-F001](/features/hr-f001-ingestion/) (automatic part), [HR-F012](/features/hr-f012-admin-observability/) |
| M6 · Dashboard → Release 1.0 | Close the MVP | Statistics and dashboard, runbooks, acceptance of the product scope and the 1.0.0 cut | [HR-F009](/features/hr-f009-dashboard/) |

[HR-F011](/features/hr-f011-notifications/) (notifications, P2) is outside release 1.0 and has no milestone.

## Ordering rationale

Milestones are ordered by dependency and risk, not by feature number.

- M0 is large on purpose: without `building-blocks`, the outbox and the CI boundary checks, the first aggregate would be written without the agreed rules.
- M1 comes before the full search: if the end-to-end skeleton breaks, it breaks on one flow, not on twenty filters.
- Search and map (M2) come before history (M3), which depends on observations that M1 already produces.
- Deployment is in M4, together with authentication: M4 deploys to a disposable staging server reachable only through Tailscale, so the app runs in a real environment ([D35](/adr/d35-environments-and-staging-deployment/)). Real history accumulation and backups start with production, which is defined when the product is published. Production alerting follows in M5. See [Environments and deployment](/operations/environments/).
- Automated ingestion (M5) depends on an idealista key that may not be granted, so it does not block the rest of the product.
- Runbooks and the 1.0 cut close the roadmap in M6.

## Issue model

- One issue per vertical slice: a deliverable piece of about 400 authored changed lines (a planning heuristic, not a cap) with its own acceptance criteria taken from `HR-FNNN-ACn`, built with strict TDD ([D14](/adr/d14-testing/)) and delivered as one reviewable pull request.
- Each feature is a parent issue and its slices are linked sub-issues. The foundation has its own parent issue.
- Labels: context and app (`ctx:<context>`, `app:<app>`, `pkg:<package>`), type (`type:feature`, `type:foundation`, `type:docs`) and priority (`P0` to `P2`).
- A GitHub project board tracks the flow of the issues.

## Planning depth

Everything is sliced up front: all seven milestones have their vertical-slice issues, plus one parent issue per feature and one for the foundation. [HR-F011](/features/hr-f011-notifications/) gets a parent issue without milestone. The full plan is versioned and reviewable before issues were created in GitHub.

## Parent issues

| Parent | Milestone | Issue |
| --- | --- | --- |
| Foundation | M0 · Foundation | [#3](https://github.com/JSisques/house-radar/issues/3) |
| [HR-F001 · Listing ingestion](/features/hr-f001-ingestion/) | M1 (manual), M5 (automatic) | [#4](https://github.com/JSisques/house-radar/issues/4) |
| [HR-F002 · Listing normalization](/features/hr-f002-normalization/) | M1 | [#5](https://github.com/JSisques/house-radar/issues/5) |
| [HR-F003 · Search and filters](/features/hr-f003-search/) | M2 | [#6](https://github.com/JSisques/house-radar/issues/6) |
| [HR-F004 · Property detail](/features/hr-f004-property-detail/) | M1 (basic), later milestones | [#7](https://github.com/JSisques/house-radar/issues/7) |
| [HR-F005 · Duplicate detection](/features/hr-f005-duplicates/) | M3 | [#8](https://github.com/JSisques/house-radar/issues/8) |
| [HR-F006 · Map](/features/hr-f006-map/) | M2 | [#9](https://github.com/JSisques/house-radar/issues/9) |
| [HR-F007 · Favorites and saved searches](/features/hr-f007-favorites-saved-searches/) | M4 | [#10](https://github.com/JSisques/house-radar/issues/10) |
| [HR-F008 · Price history](/features/hr-f008-price-history/) | M3 | [#11](https://github.com/JSisques/house-radar/issues/11) |
| [HR-F009 · Dashboard](/features/hr-f009-dashboard/) | M6 | [#12](https://github.com/JSisques/house-radar/issues/12) |
| [HR-F010 · Users and authentication](/features/hr-f010-users/) | M4 | [#13](https://github.com/JSisques/house-radar/issues/13) |
| [HR-F011 · Notifications](/features/hr-f011-notifications/) | None (post-1.0) | [#14](https://github.com/JSisques/house-radar/issues/14) |
| [HR-F012 · Administration and observability](/features/hr-f012-admin-observability/) | M5 | [#15](https://github.com/JSisques/house-radar/issues/15) |

## Issues per milestone

| Milestone | Parent issues | Slice issues |
| --- | --- | --- |
| M0 · Foundation | 1 | 26 |
| M1 · Walking skeleton | 3 | 14 |
| M2 · Search & map | 2 | 16 |
| M3 · History & duplicates | 2 | 14 |
| M4 · Users | 2 | 16 |
| M5 · Automated ingestion | 1 | 17 |
| M6 · Dashboard → Release 1.0 | 1 | 9 |
| No milestone (HR-F011) | 1 | 0 |
| **Total** | **13** | **112** |

## Needs definition

The staging deployment ([#100](https://github.com/JSisques/house-radar/issues/100)) is defined in [Environments and deployment](/operations/environments/). Backups ([#101](https://github.com/JSisques/house-radar/issues/101)) are production work: they leave M4 and are designed with production, when the product is published.
