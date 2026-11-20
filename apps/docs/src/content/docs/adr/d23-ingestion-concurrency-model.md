---
title: "D23. Ingestion concurrency model"
description: "Ingestion scales by distributing work across identical stateless workers, with per-source queues and rate limits, and relies on idempotency instead of distributed locks."
sidebar:
  order: 24
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

House Radar ingests listings from N sources ([D3](/adr/d03-source-strategy/)): the idealista Search API, authorized agency feeds, and manual import. `apps/ingestion` ([D4](/adr/d04-backend-framework/)) runs on BullMQ + Redis ([D7](/adr/d07-queues-and-scheduling/)). Ingestion workers must scale without colliding with each other, and every source has its own quota that must be respected no matter how many workers are running.

## Decision

Scale work, not "one worker per source".

1. **Scheduling is separated from execution.** BullMQ repeatable jobs enqueue `sync-source(<source>)`. Ingestion workers are stateless, identical replicas that only consume jobs (`docker compose up --scale ingestion=N`).
2. **Atomic job claiming.** BullMQ moves a job to active atomically with a lock. If a worker dies, the lock expires and another worker retries the job (stalled job recovery).
3. **Fan-out.** `sync-source` discovers listings and enqueues one `fetch-listing(<source>, <externalId>)` job per listing, so N workers share the work of a single source.
4. **Deterministic job IDs**, for example `fetch:<source>:<externalId>:<runId>`, so the same job is not enqueued twice within a run.
5. **One queue per source with its own rate limiter.** The BullMQ limiter is global per queue (shared by all workers), so each source's quota is respected regardless of the number of workers. BullMQ "groups" (a single queue with per-group limits) are a paid Pro feature and are not used.
6. **The database is the last line of defense** ([D6](/adr/d06-persistence/)):
   - Unique `(source, external_id)` plus upsert: the same listing is updated, never duplicated (see the [D21](/adr/d21-duplicate-detection-policy/) amendment).
   - Observations are append-only and immutable, with uniqueness per `(listing, run)`.
   - The Property aggregate uses optimistic locking (MikroORM `version`) for duplicate linking and representative price recomputation.
7. **Connectors are adapters of one port.** Each connector implements the same port (`discover()`, `fetch(externalId)`) and returns the normalized model ([D10](/adr/d10-cross-cutting-architecture/)). Adding a source means a new adapter plus registering its queue; workers do not change.

Principle: make concurrent duplication harmless (idempotency) instead of relying on hand-made distributed locks.

The flow is illustrated in [Ingestion concurrency](/architecture/ingestion-concurrency/). Operational visibility of queues and jobs follows [D15](/adr/d15-observability/).

## Consequences

- Throughput scales horizontally by changing the number of replicas, with no code or configuration change per source.
- A single large source is processed in parallel by all workers.
- Per-source quotas hold regardless of the number of workers.
- A crashed worker loses no work: its jobs are retried by another replica.
- Two workers processing the same listing is a harmless case, not an error: the database guarantees the end state.
- Fan-out creates many small jobs per run, which increases Redis traffic and requires per-job observability (Bull Board, metrics).
- Each queue needs its rate limiter configured when a source is added.

## Alternatives considered

- **One dedicated worker per source:** does not scale within a source (a large source is limited to one worker) and leaves capacity idle when a source has no work.
- **Hand-made distributed locks:** error-prone (expiry, clock skew, forgotten releases). Idempotency is preferred because it stays correct even when the lock fails.
- **BullMQ Pro groups:** would allow a single queue with per-group limits, but it is a paid feature. One queue per source achieves the same result with the open source library.
