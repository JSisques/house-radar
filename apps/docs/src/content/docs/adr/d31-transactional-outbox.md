---
title: "D31. Transactional outbox"
description: "Domain events are written to an outbox table in the same transaction as the aggregate; a relay publishes them through BullMQ and consumers are idempotent."
sidebar:
  order: 32
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Projections ([D19](/adr/d19-search-read-model/)) and cross-context reactions ([D28](/adr/d28-bounded-context-map/)) depend on domain events. [D24](/adr/d24-own-building-blocks/) and [D25](/adr/d25-cqrs-and-context-structure/) had command handlers publish the pulled events to the Nest `EventBus` after saving, which leaves a window between commit and publish where a crash loses the events and leaves projections silently stale.

## Decision

- The write repository persists the aggregate and its recorded domain events (`peekDomainEvents()`) into an `outbox_event` table of the same schema in the same transaction (MikroORM unit of work, [D6](/adr/d06-persistence/)). Either everything is stored or nothing. Events are cleared from the aggregate (`clearDomainEvents()`) only after the commit, so a failed save that is retried does not lose them.
- Command handlers no longer call `eventBus.publishAll(...)`.
- An outbox relay reads rows with `published_at is null`, publishes them through BullMQ ([D7](/adr/d07-queues-and-scheduling/)) and marks them as published.
- Delivery is at-least-once. Consumers (projections, cross-context handlers) are idempotent and deduplicate by event ID with a `processed_event (event_id, consumer)` table ([D23](/adr/d23-ingestion-concurrency-model/)).
- Every schema that emits events (`ingestion`, `listings`, `properties`, `identity`) has its own `outbox_event` table.
- The outbox doubles as an auditable event log that can be replayed to rebuild projections.

Details are in [Database schema](/architecture/database-schema/) and [Code conventions](/architecture/conventions/).

## Consequences

- An event cannot be lost between commit and publish.
- Events can be replayed to rebuild projections when consolidation rules change.
- Publication is asynchronous: projections are eventually consistent, with a small delay set by the relay.
- A relay and a retention policy for published rows must be operated and observed ([D15](/adr/d15-observability/)).
- Consumers must be idempotent and tracked in `processed_event`.
- Delivery order is not guaranteed (several BullMQ workers): every outbox row carries `aggregate_version`, and consumers apply an event only if it is newer than the version already applied (`properties.projected_listing.version`), so a late event never overwrites newer state.
- Supersedes in part the event publication described in D24 and D25.

## Alternatives considered

- **In-process publication after commit plus a periodic projection rebuild:** simpler, but a crash between commit and publish leaves projections stale until the next rebuild, which can be hours and contradicts the product principle of trustworthy data. Discarded.
