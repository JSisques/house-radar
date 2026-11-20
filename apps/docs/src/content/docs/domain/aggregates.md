---
title: Aggregates
description: Aggregates of each bounded context with their identity, state, invariants, events and projections.
sidebar:
  order: 2
---

Decision [D29](/adr/d29-aggregate-boundaries/): aggregates are small and protect invariants; derived data lives in projections. Contexts are defined in [Context map](/architecture/context-map/) and the tables in [Database schema](/architecture/database-schema/). Terms are defined in [Ubiquitous language](/domain/ubiquitous-language/). Events are delivered through the transactional outbox ([D31](/adr/d31-transactional-outbox/)); every ID is a UUIDv7 ([D32](/adr/d32-uuid-v7/)).

## `ingestion`

### `Source`

- **Identity:** `SourceId`, a stable text key such as `idealista` or `manual`.
- **State:** kind (`api`, `feed`, `manual`) and an enabled flag. Cadence and rate limit come from deployment configuration, not from the aggregate.
- **Events:** none.

### `IngestionRun`

- **Identity:** `IngestionRunId`.
- **State:** source, start and end time, status (`running`, `succeeded`, `partial`, `failed`) and counters (discovered, processed, failed).
- **Invariants:** a run closes once; its status follows from its counters.
- **Events:** `IngestionRunCompleted`, `IngestionRunFailed` (they feed the alerts of HR-F012).
- **Disappearance:** when a run closes, `ingestion` tells `listings` which listings of that source were not seen. It only reports; `listings` decides.

### `ExtractionError`

- Separate append-only record referenced by `runId`. A run may accumulate many errors, so they are not part of `IngestionRun` (same reasoning as `Observation`).

## `listings`

### `Listing`

The advertisement and its current state.

- **Identity:** `ListingId` plus provenance: `SourceId`, optional `ExternalId` and `ListingUrl`. Uniqueness is `(source, external_id)` ([D23](/adr/d23-ingestion-concurrency-model/)); for manual listings, the normalized URL.
- **State:** declared attributes as `Known<T> | Unknown` (type, areas, bedrooms, bathrooms, condition, features, energy certificate, and so on), `GeoPoint` and `LocationPrecision`, current price, status (`active`, `disappeared`, `unknown`), `missedRuns` and last checked date.
- **Invariants:**
  - Price and status change only through a new observation.
  - A disappeared listing observed again becomes `active`.
  - `missedRuns` is reset by every observation; at N = 3 the listing becomes `disappeared` ([D20](/adr/d20-listing-consolidation-rules/)).
  - Descriptive corrections are audited.
- **Events:** `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared`, `ListingReappeared`, `ListingDetailsCorrected`.

### `Observation`

Its own aggregate, referenced by `ListingId`.

- **State:** price, status, observed date and the run that produced it (none for a manual check).
- **Invariants:** immutable and append-only; unique per `(listing, run)` ([D23](/adr/d23-ingestion-concurrency-model/)).
- **Why separate:** observations are kept forever; an active listing checked daily accumulates hundreds per year. Inside `Listing` the aggregate would grow without bound. `Observation` shares no invariant with `Listing` except "written together", which the command handler guarantees by persisting both in the same transaction.

## `properties`

### `Property`

Minimal by design.

- **Identity:** `PropertyId`.
- **State:** member listing IDs and the chosen location (the most precise by default; the user can change it).
- **Invariants:**
  - A listing belongs to exactly one property.
  - The chosen location is one of its listings' locations or a user-set valid point.
- **Events:** `PropertiesMerged` (when a property is removed because its listings moved into another one).

### `DuplicateCandidate`

- **Identity:** `DuplicateCandidateId`; a pair of listings.
- **State:** status `suggested`, `linked` or `dismissed`.
- **Invariants:** a dismissed pair is never suggested again ([D21](/adr/d21-duplicate-detection-policy/)).

### Property lifecycle

1. **Create (1:1).** Every new listing gets its own `Property`.
2. **Link.** Confirming a duplicate as "same property" moves the listing into the other property.
3. **Remove empty.** A property left without listings is removed and `PropertiesMerged` is emitted.
4. **Unlink.** Unlinking moves the listing back to a new property.

### Projections

Read models updated from `listings` events. The aggregate protects invariants; derived data is computed for reading and can be rebuilt from events and observations if the consolidation rules change.

| Projection | Content |
| --- | --- |
| `property_search_view` | Consolidated attributes with conflicts ([D20](/adr/d20-listing-consolidation-rules/)), representative price ([D19](/adr/d19-search-read-model/)), municipality and location. Used by search, detail and dashboard. |
| `property_price_point` | Evolution of the lowest active price per property. |

## `geography`

Read-only reference data, loaded by an import script from IGN; Galicia only in the MVP. It has no aggregates and emits no events.

- **`Municipality`:** INE code, name, province and boundary polygon.
- **`Province`:** code and name.

## `identity`

### `Account`

- **Identity:** `AccountId`.
- **State:** email, password hash, failed sign-in attempts, `lockedUntil` and role (a single role, prepared for more).
- **Invariants:** five failed attempts lock the account for 15 minutes ([D13](/adr/d13-users-and-authentication/)).
- **Events:** `AccountCreated`.
- Sessions are infrastructure (Redis), not an aggregate.

## `users`

### `UserProfile`

- **Identity:** the same ID as the `Account`.
- **State:** time zone.

### `Favorite`

- Its own aggregate: a user's favorite property. Unique `(user, property)`.

### `SavedSearch`

- **State:** name and filters as a value object (the same search params validated by TanStack Router).
- **Invariants:** the name is unique per user.

### `PropertiesMerged` and favorites

`users` listens to `PropertiesMerged` and re-points the favorites of the removed property to the surviving one, deduplicating: if the user already had the surviving property as a favorite, the duplicate favorite is dropped. The handler is idempotent ([D31](/adr/d31-transactional-outbox/)).

## Event summary

| Event | Emitted by | Consumed by |
| --- | --- | --- |
| `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared` | `listings` | `properties` |
| `ListingReappeared`, `ListingDetailsCorrected` | `listings` | `properties` (projections) |
| `PropertiesMerged` | `properties` | `users` |
| `AccountCreated` | `identity` | `users` |
| `IngestionRunCompleted`, `IngestionRunFailed` | `ingestion` | Alerts (HR-F012) |
