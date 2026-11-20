---
title: "D32. UUIDv7 identifiers"
description: "Aggregate IDs, event IDs and outbox rows use time-ordered UUIDv7 generated with the uuid package, stored in native uuid columns."
sidebar:
  order: 33
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Several tables grow without bound and are append-only: `observation`, `outbox_event` and `extraction_error` ([D29](/adr/d29-aggregate-boundaries/), [D31](/adr/d31-transactional-outbox/)). Random identifiers (UUIDv4) insert at random positions of the primary key B-tree, which fragments the index. [D24](/adr/d24-own-building-blocks/) generated UUIDs with `globalThis.crypto.randomUUID()`, which produces v4.

## Decision

- All aggregate IDs, event IDs and outbox rows use UUIDv7.
- They are generated with the `uuid` package (`v7()`) in `building-blocks`, which works in Node and in the browser (`apps/web`).
- Column type: native `uuid` ([D6](/adr/d06-persistence/)).

## Consequences

- IDs are time-ordered, so inserts append to the index and fragmentation is avoided on growing tables.
- IDs remain globally unique and can be generated anywhere, without a database round trip.
- Ordering by ID equals ordering by creation time.
- An ID reveals its creation timestamp; it must not be used where that is sensitive.
- Adds the `uuid` dependency to `building-blocks`.
- Supersedes in part the UUID generation described in D24.

## Alternatives considered

- **UUIDv4 with `crypto.randomUUID()`:** no dependency and works everywhere, but random order fragments the indexes of append-only tables. Discarded.
