# Feature: ingestion-concurrency

## Objective

Document the ingestion concurrency and scaling model as ADR D23 plus an architecture page with a flow diagram (en + es).

## Decision (user-approved 2026-11-20)

**D23 Ingestion concurrency model:** scale work, not "one worker per source".

1. Scheduling is separated from execution: BullMQ repeatable jobs enqueue `sync-source(<source>)`; ingestion workers are stateless, identical replicas that only consume (`docker compose up --scale ingestion=N`).
2. BullMQ moves a job to active atomically with a lock; if a worker dies the lock expires and the job is retried by another worker (stalled job recovery).
3. Fan-out: `sync-source` discovers listings and enqueues one `fetch-listing(<source>, <externalId>)` per listing, so N workers share the work of a single source.
4. Deterministic job IDs (e.g. `fetch.<source>.<externalId>.<runId>`) so the same job is not enqueued twice in a run.
5. One queue per source with its own rate limiter; BullMQ's limiter is global per queue (shared by all workers), so each source's quota is respected regardless of worker count. BullMQ "groups" (single queue, per-group limits) are a paid Pro feature and are not used.
6. The database is the last line of defense: unique `(source, external_id)` + upsert (same listing is updated, see D21 amendment); observations append-only and immutable with uniqueness per `(listing, run)`; the Property aggregate uses optimistic locking (MikroORM `version`) for duplicate linking and representative price recomputation.
7. Each connector is an adapter implementing the same port (`discover()`, `fetch(externalId)`) returning the normalized model (D10); adding a source = new adapter + register its queue; workers unchanged.

Principle: make concurrent duplication harmless (idempotency) instead of relying on hand-made distributed locks.

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | ADR D23 (en + es) + ADR index | delegated (writer trigger: 2+ files) | [x] | af07b9f |
| T2 | Architecture page "Ingestion concurrency" with inline SVG diagram component (en + es); link from architecture overview and HR-F001 | delegated | [x] | 2f8089a |

## Checks

`pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`. TDD (D14) not applicable: documentation content.

## Progress / Evidence

- Branch `docs/ingestion-concurrency` created from `main` (b4eb95c).
- T1 done (af07b9f): ADR D23 en + es, index rows and ranges updated to D23.
- T2 done (2f8089a): architecture page en + es, `IngestionFlowDiagram.astro` inline SVG component, linked from overview and HR-F001.
- Verification: `pnpm docs:test` pass (4/4), `pnpm docs:check-i18n` OK (50 pages x 1 locale), `pnpm docs:check` 0 errors, `pnpm docs:build` 101 pages built; svg with title/desc present in built en and es pages.

- 329d208: diagram boxes widened after visual check (headless Chrome, light/dark, en/es).
- Review: medium risk (`IngestionFlowDiagram.astro`), consent granted, **approved and acknowledged**. Warnings fixed in 8c4e3c1: BullMQ custom job IDs cannot contain `:` (now `fetch.<source>.<externalId>.<runId>`); "never the same job" corrected to at-least-once delivery. Suggestions not applied: static SVG ids (component used once per page), retry of rejected observations.

## Next step

Open a PR from `docs/ingestion-concurrency` to `main` (user decision).
