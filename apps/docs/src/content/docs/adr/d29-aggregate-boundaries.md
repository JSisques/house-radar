---
title: "D29. Aggregate boundaries"
description: "Observation and ExtractionError are their own append-only aggregates, Property is minimal, and derived consolidation data lives in projections."
sidebar:
  order: 30
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

With the contexts defined ([D28](/adr/d28-bounded-context-map/)), we need aggregate boundaries that protect invariants without growing unbounded or becoming a bottleneck under concurrent ingestion ([D23](/adr/d23-ingestion-concurrency-model/)). An active listing checked daily accumulates hundreds of observations per year, and a run may accumulate many extraction errors. Consolidated attributes and the representative price ([D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/)) are derived data that can change when the rules change.

## Decision

1. **`Observation` is its own aggregate** in `listings`, referenced by `ListingId`. It is immutable and append-only (price, status, observed date, run), unique per `(listing, run)`. It shares no invariant with `Listing` except "written together", which the command handler guarantees by persisting both in the same transaction.
2. **`Listing` holds current state only**: declared attributes, location and precision, current price, status, `missedRuns`. Price and status change only through a new observation; descriptive corrections are audited.
3. **`Property` is minimal**: identity, member listing IDs and chosen location. Invariants: a listing belongs to exactly one property; the chosen location is one of its listings' locations or a user-set valid point.
4. **Property lifecycle**: every new listing gets its own `Property` (1:1). Confirming a duplicate moves the listing into the other property; a property left without listings is removed; unlinking moves the listing to a new property. `DuplicateCandidate` is a pair with status `suggested`, `linked` or `dismissed`; a dismissed pair is never suggested again ([D21](/adr/d21-duplicate-detection-policy/)).
5. **Derived data are projections, not aggregate state.** `property_search_view` (consolidated attributes, conflicts, representative price, municipality) and the lowest-active-price evolution are read models updated from `listings` events and rebuildable.
6. **`ExtractionError` is a separate append-only record** in `ingestion`, referenced by `runId`, for the same reason as `Observation`.
7. Disappearance is decided by `listings`: `ingestion` reports the listings not seen when a run closes, `Listing` increments `missedRuns` (reset by every observation) and becomes `disappeared` at N = 3 ([D20](/adr/d20-listing-consolidation-rules/)).

Details are in [Aggregates](/domain/aggregates/).

## Consequences

- Aggregates stay small: loading a `Listing` never loads its history, and concurrent writes contend only on the rows they change.
- Observations and errors can grow without limit with no effect on aggregate size.
- Persisting a listing and its observation in one transaction is a handler responsibility, not an aggregate invariant.
- Consolidation rules can change and the projections be recomputed from events and observations without data migration of aggregates.
- Search and detail depend on projections being up to date, so event delivery must be reliable ([D31](/adr/d31-transactional-outbox/)).
- More tables and aggregates than a single large model.

## Alternatives considered

- **`Observation` inside `Listing`:** one consistency boundary, but the aggregate grows without bound and every price check loads and locks the whole history. Discarded.
- **Full `Property` holding derived data (consolidated attributes, representative price):** the aggregate would carry data that is recomputed on every listing change, increasing contention and mixing invariants with read concerns. Discarded in favor of a minimal aggregate plus projections.
