---
title: "D30. One PostgreSQL schema per context"
description: "Each bounded context owns a PostgreSQL schema; there are no foreign keys across schemas and cross-context reads go through projections."
sidebar:
  order: 31
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Persistence is PostgreSQL + PostGIS with MikroORM ([D6](/adr/d06-persistence/)), accessed through adapters ([D10](/adr/d10-cross-cutting-architecture/)). The contexts defined in [D28](/adr/d28-bounded-context-map/) should not be coupled through the database, even though they share one server.

## Decision

- One PostgreSQL schema per bounded context: `ingestion`, `listings`, `properties`, `geography`, `identity`, `users`.
- No foreign keys across schemas: contexts reference each other by ID. Foreign keys are allowed inside a schema.
- Each context owns its migrations and permissions.
- Cross-context reads go through projections ([D29](/adr/d29-aggregate-boundaries/)), never cross-schema `JOIN`s.
- Defaults: money as `bigint` cents; locations as `geography(Point, 4326)` (radius in metres with `ST_DWithin`); municipality boundaries as `geometry(MultiPolygon, 4326)`; unknown values as `NULL` plus an origin column (`declared`, `calculated`, `inferred`) where the origin matters ([D20](/adr/d20-listing-consolidation-rules/)).

Tables are described in [Database schema](/architecture/database-schema/).

## Consequences

- The database boundaries mirror the context boundaries, and a context can later move to its own database without changing its model.
- Permissions can be granted per schema.
- Referential integrity across contexts is not enforced by the database: handlers and ports must verify it (for example `AssertPropertyExists`) and orphan references must be tolerated or cleaned by events.
- Reading data from two contexts needs a projection or an application-level composition.
- Migrations are per context, so the tooling must run several migration streams.

## Alternatives considered

- **Single `public` schema with table prefixes:** simpler tooling, but nothing prevents cross-context joins and foreign keys, and boundaries erode silently. Discarded.
