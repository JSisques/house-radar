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

### M2. `listings` aggregates (2026-11-20)

**`Listing`** — the advertisement and its current state.

- Identity: `ListingId` + provenance (`SourceId`, optional `ExternalId`, `ListingUrl`). Uniqueness: `(source, external_id)` (D23); manual listings: normalized URL.
- Current state: declared attributes as `Known<T> | Unknown` (type, areas, bedrooms, bathrooms, condition, features, energy certificate…), `GeoPoint` + `LocationPrecision`, current price, status (`active` / `disappeared` / `unknown`), last checked date.
- Invariants: price and status change only through a new observation; a disappeared listing observed again becomes `active`; descriptive corrections are audited.
- Events: `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared`, `ListingReappeared`, `ListingDetailsCorrected`.

**`Observation`** — its own aggregate (user decision), referenced by `ListingId`.

- Immutable, append-only: price, status, observed date, run that produced it. Unique per `(listing, run)` (D23).
- Reason: observations are kept forever (an active listing checked daily accumulates hundreds per year); inside `Listing` the aggregate would grow without bound. `Observation` is immutable and shares no invariant with `Listing` except "written together", which the handler guarantees by persisting both in the same transaction (small aggregates referenced by ID).

### M3. `properties` aggregates and projections (2026-11-20)

- Lifecycle: every new listing gets its own `Property` (1:1). Confirming a duplicate as "same property" moves the listing into the other property; a property left without listings is removed. Unlinking moves the listing back to a new property.
- **`Property`** — minimal (user decision): identity, member listing IDs, chosen location (most precise by default, user-changeable). Invariants: a listing belongs to exactly one property; the chosen location is one of its listings' locations or a user-set valid point.
- **`DuplicateCandidate`** — pair of listings with status `suggested` / `linked` / `dismissed`; a dismissed pair is never suggested again (D21).
- **Projections (read models)** updated from `listings` events: `property_search_view` (consolidated attributes with conflicts per D20, representative price per D19, municipality, location) used by search, detail and dashboard; lowest-active-price evolution per property. Reason: the aggregate protects invariants; derived data is computed for reading and can be rebuilt from events and observations if consolidation rules change.

## Pending discovery

- Aggregates for `ingestion`, `identity`, `users`; `geography` reference data.
- Read models / projections.
- PostgreSQL + PostGIS schema.
- Output: docs pages + ADRs.
