---
title: "D28. Bounded context map"
description: "The backend has six bounded contexts (ingestion, listings, properties, geography, identity, users) with explicit relationships; pricing-history is not a context."
sidebar:
  order: 29
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

[D4](/adr/d04-backend-framework/) organizes the backend by bounded contexts and listed candidates (`listings`, `properties`, `pricing-history`, `ingestion`, `users`), and [D13](/adr/d13-users-and-authentication/) added `identity`. Before designing aggregates and the database we need the final map: which contexts exist, what each one owns and how they talk to each other ([D10](/adr/d10-cross-cutting-architecture/), [D25](/adr/d25-cqrs-and-context-structure/)).

## Decision

Six bounded contexts:

| Context | Responsibility | Main aggregates |
| --- | --- | --- |
| `ingestion` | Sources, runs, connectors ([D23](/adr/d23-ingestion-concurrency-model/)) | `Source`, `IngestionRun` |
| `listings` | Listings and what was observed about each one | `Listing`, `Observation` |
| `properties` | Real properties, consolidation and duplicates | `Property`, `DuplicateCandidate` |
| `geography` | Municipalities and provinces (IGN boundaries, [D18](/adr/d18-location-pin-declared-precision/)) | Read-only reference data |
| `identity` | Account, credentials, session, lockout ([D13](/adr/d13-users-and-authentication/)) | `Account` |
| `users` | Profile, preferences, favorites, saved searches | `UserProfile`, `Favorite`, `SavedSearch` |

Relationships:

| From | To | Mechanism |
| --- | --- | --- |
| `ingestion` | `listings` | Port `RecordObservation` (synchronous command, idempotent upsert, [D23](/adr/d23-ingestion-concurrency-model/)) |
| `listings` | `properties` | Events `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared` |
| `properties` | `geography` | Port `ResolveMunicipality` |
| `users` | `properties` | Port `AssertPropertyExists` |
| `identity` | `users` | Event `AccountCreated` |

Two changes from the D4 candidate list:

- `pricing-history` is not a context. Price history is the listing's observations ([D20](/adr/d20-listing-consolidation-rules/)) and lives in `listings`; the evolution of a property's lowest active price is a projection inside `properties`.
- `geography` is added: point-in-polygon municipality resolution has its own reference data and its own lifecycle.

The dashboard (HR-F009) is not a context: it is a set of queries over `properties` read models.

Details are in [Context map](/architecture/context-map/).

## Consequences

- Each context owns its data and language; the only coupling points are the ports and events listed above.
- `listings` does not know `properties`: it emits events and `properties` reacts, so consolidation rules can change without touching ingestion.
- Price history needs no extra context or synchronization: it is a read of observations plus a projection.
- `geography` is a small read-only context, which adds a module but isolates PostGIS reference data and the IGN import.
- Every new cross-context interaction must be added to the map as a port or an event.

## Alternatives considered

- **Keep `pricing-history` as a context:** it would duplicate the observations already owned by `listings` and require synchronizing two stores for one fact. Discarded.
- **No `geography` context (boundaries inside `properties`):** mixes read-only reference data with a consolidation model that changes often, and makes the IGN import part of `properties` migrations. Discarded.
