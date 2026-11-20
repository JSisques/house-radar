# Feature: data-model

## Objective

Design the domain model before code: bounded context map, aggregates with invariants and value objects, domain events and their consumers, and the resulting PostgreSQL + PostGIS schema. Publish it in the docs portal (en + es) and as ADRs for structural decisions.

## Status

Discovery in progress. Decisions are recorded here as they are taken.

## Decisions taken (user-approved)

### M1. Bounded context map (2026-11-20)

| Context | Responsibility | Main aggregates |
|---|---|---|
| `ingestion` | Sources, runs, connectors (D23) | `Source`, `IngestionRun` |
| `listings` | Listings and what was observed about each one | `Listing`, `Observation` |
| `properties` | Real properties, consolidation and duplicates | `Property`, `DuplicateCandidate` |
| `geography` | Municipalities and provinces (IGN boundaries, D18) | Read-only reference data |
| `identity` | Account, credentials, session, lockout (D13) | `Account` |
| `users` | Profile, preferences, favorites, saved searches | `UserProfile`, `Favorite`, `SavedSearch` |

Changes from the D4 candidate list:

- `pricing-history` is not a context: price history is the listing's observations (D20) and lives in `listings`; the property's lowest-active-price evolution is a projection inside `properties`.
- `geography` is added: point-in-polygon municipality resolution with its own reference data.

Relationships:

```
ingestion ──(port: RecordObservation)──▶ listings
listings ──(events: ListingObserved, ListingPriceChanged, ListingDisappeared)──▶ properties
properties ──(port: ResolveMunicipality)──▶ geography
users ──(port: AssertPropertyExists)──▶ properties
identity ──(event: AccountCreated)──▶ users
```

- `ingestion` → `listings`: synchronous command through a port (idempotent upsert, D23).
- `listings` → `properties`: domain events (representative price, attribute conflicts and duplicate candidates react to listing changes).
- Dashboard (HR-F009) is not a context: queries over `properties` read models.

## Pending discovery

- Aggregates per context (invariants, value objects, events).
- Read models / projections.
- PostgreSQL + PostGIS schema.
- Output: docs pages + ADRs.
