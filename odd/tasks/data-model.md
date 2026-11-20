# Feature: data-model

## Objective

Design the domain model before code: bounded context map, aggregates with invariants and value objects, domain events and their consumers, and the resulting PostgreSQL + PostGIS schema. Publish it in the docs portal (en + es) and as ADRs for structural decisions.

## Status

Discovery complete; output tasks T1-T3 done (see Tasks). Pending: PR review.

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

### M4. Remaining contexts (2026-11-20)

**`ingestion`**

- `Source`: id (`idealista`, `manual`…), kind (`api` / `feed` / `manual`), enabled flag. Cadence and rate limit come from deployment configuration.
- `IngestionRun`: source, start/end, status (`running` / `succeeded` / `partial` / `failed`), counters (discovered, processed, failed). Emits `IngestionRunCompleted`, `IngestionRunFailed` (feed D15 alerts).
- `ExtractionError`: separate append-only record referenced by `runId` (a run may accumulate many errors; same reasoning as `Observation`).
- Disappearance: when a run closes, `ingestion` tells `listings` which listings of that source were not seen. `Listing` keeps a `missedRuns` counter reset by every observation; at N = 3 (D20) it becomes `disappeared`. `listings` decides (its invariant); `ingestion` only reports.

**`identity`**

- `Account`: email, password hash, failed attempts, `lockedUntil`, role (single role, prepared for more). Enforces 15-minute lock after 5 failures.
- Sessions are infrastructure (Redis), not an aggregate.

**`users`**

- `UserProfile`: same ID as `Account`, time zone.
- `Favorite`: own aggregate, unique `(user, property)`.
- `SavedSearch`: name unique per user; filters as a value object (same search params validated by TanStack Router).
- Property merge: `users` listens to `PropertiesMerged` and re-points favorites from the removed property to the surviving one, deduplicating.

**`geography`**

- `Municipality` (INE code, name, province, boundary polygon) and `Province`: read-only, loaded from IGN by an import script; Galicia only in the MVP.

### M5. Database layout (2026-11-20)

- One PostgreSQL schema per bounded context (user decision): `ingestion`, `listings`, `properties`, `geography`, `identity`, `users`. No foreign keys across schemas; contexts reference each other by ID. Each context owns its migrations and permissions. Cross-context reads go through projections (M3), never cross-schema `JOIN`s.
- Defaults (not contested): money as `bigint` cents; locations as `geography(Point, 4326)` (radius in metres with `ST_DWithin`); municipality boundaries as `geometry(MultiPolygon, 4326)` (point-in-polygon); unknown values as `NULL` plus an origin column (`declared` / `calculated` / `inferred`) where the origin matters (D20, product principle 4).

### M6. Event delivery: transactional outbox (2026-11-20)

- Domain events are written to an `outbox` table in the same transaction as the aggregate (user decision). A relay reads pending rows, publishes them through BullMQ (D7) and marks them as sent. Either everything is stored or nothing: an event cannot be lost between commit and publish.
- Consumers (projections, cross-context handlers) are idempotent (already required by D23) and deduplicate by `eventId`.
- Ordering: delivery order is not guaranteed; outbox rows carry `aggregate_version` and consumers apply an event only if it is newer than the version already applied (`properties.projected_listing`). Added after the review of the outbox templates (2026-11-20).
- The outbox doubles as an auditable event log that can be replayed to rebuild projections (M3).
- Rejected: in-process publication after commit + periodic projection rebuild (a crash between commit and publish leaves projections silently stale for hours, contradicting product principle 1).
- Follow-up: update conventions (C2/C4/C6, D25) and the backend skill templates — handlers no longer call `eventBus.publishAll(...)`; the write repository persists the aggregate's recorded events (`peekDomainEvents()`) into the outbox within the transaction and calls `clearDomainEvents()` only after commit. Consumers are BullMQ consumers in `transport` that send a command; the idempotent handler uses `ITransactionManager` and `IProcessedEventRepository` ports.

### M7. Identifiers: UUIDv7 (2026-11-20)

- All aggregate IDs, event IDs and outbox rows use UUIDv7 (user decision): time-ordered, so inserts append to the B-tree index (no fragmentation on ever-growing append-only tables: `observation`, `outbox_event`, `extraction_error`), still globally unique and generated anywhere; ordering by ID equals ordering by creation.
- Generated with the `uuid` package (`v7()`), which works in Node and the browser. Supersedes the C6 note about `globalThis.crypto.randomUUID()` (v4) in `building-blocks`.
- Column type: native `uuid`.

### M8. Table-level schema (derived from M1–M7; reviewed in the PR)

All tables: `id uuid primary key` (v7) unless stated, `created_at timestamptz not null`, `updated_at timestamptz not null` on mutable rows. Enums as `text` + `check` constraints (closed catalogs from the feature specs). No cross-schema foreign keys.

**`ingestion`**

- `source` (`id text pk`, e.g. `idealista`; `kind`; `enabled`).
- `ingestion_run` (`source_id`, `started_at`, `finished_at`, `status`, `discovered_count`, `processed_count`, `failed_count`); index `(source_id, started_at desc)`.
- `extraction_error` (`run_id`, `external_id null`, `message`, `occurred_at`); append-only; index `(run_id)`.

**`listings`**

- `listing`: provenance (`source_id`, `external_id null`, `url`, `normalized_url`); declared attributes (`property_type`, `condition`, `built_area_m2`, `usable_area_m2`, `plot_area_m2`, `bedrooms`, `bathrooms`, `year_built`, nullable boolean features `has_garage` / `has_garden` / `has_pool` / `has_terrace` / `has_balcony` / `has_elevator` / `has_heating`, `energy_certificate`, `title`, `description`), each nullable with `<attr>_origin` where relevant; `location geography(Point,4326)`, `location_precision`, `postal_code null`; `current_price_cents bigint`, `status`, `missed_runs int`, `published_at null`, `first_seen_at`, `last_checked_at`, `version int` (optimistic locking, D23). Unique `(source_id, external_id)` where `external_id is not null`; unique `(normalized_url)` for manual listings; GiST index on `location`.
- `observation`: `listing_id`, `run_id null` (manual checks), `price_cents`, `status`, `observed_at`; append-only; unique `(listing_id, run_id)` where `run_id is not null`; index `(listing_id, observed_at)`.
- `listing_correction`: audit of descriptive corrections (`listing_id`, `field`, `old_value`, `new_value`, `corrected_at`).

**`properties`**

- `property`: `chosen_location geography(Point,4326)`, `chosen_location_precision`, `version int`.
- `property_listing`: `property_id` (fk, same schema), `listing_id` unique (a listing belongs to exactly one property).
- `duplicate_candidate`: `listing_a_id`, `listing_b_id` (ordered pair, `a < b`), `status`, `reason`, `resolved_at null`; unique `(listing_a_id, listing_b_id)`.
- `property_search_view` (projection): `property_id pk`, consolidated attributes, `conflicts jsonb`, `representative_price_cents null`, `active_listing_count`, `listing_count`, `municipality_code`, `province_code`, `location geography`, `location_precision`, `price_per_m2_cents null`, `first_seen_at`, `last_updated_at`; search indexes (GiST `location`, btree on price, areas, type, municipality).
- `projected_listing` (projection support): `listing_id pk`, `property_id`, `version`, `price_cents null`, `status`; property rows are recomputed from it; ordering guard for late events.
- `property_price_point` (projection): `property_id`, `observed_at`, `lowest_active_price_cents`; index `(property_id, observed_at)`.
- `processed_event` (consumer idempotency): `event_id`, `consumer`, `processed_at`; pk `(event_id, consumer)`.

**`geography`**

- `province` (`code text pk`, `name`).
- `municipality` (`code text pk` INE, `name`, `province_code`, `boundary geometry(MultiPolygon,4326)`); GiST index on `boundary`.

**`identity`**

- `account`: `email` unique (lower-cased), `password_hash`, `role`, `failed_sign_in_attempts`, `locked_until null`.

**`users`**

- `user_profile`: `id` = account id, `time_zone`.
- `favorite`: `user_id`, `property_id`; unique `(user_id, property_id)`.
- `saved_search`: `user_id`, `name`, `filters jsonb`; unique `(user_id, name)`.
- `processed_event` (same shape as in `properties`).

**Outbox** (in every schema that emits events: `ingestion`, `listings`, `properties`, `identity`)

- `outbox_event`: `id` = event ID (v7), `aggregate_type`, `aggregate_id`, `aggregate_version int`, `event_type`, `schema_version`, `payload jsonb`, `metadata jsonb` (correlation/causation), `occurred_at`, `published_at null`; partial index on `occurred_at` where `published_at is null`.

## Pending discovery

- None. Next: output (docs pages, ADRs, conventions and skill updates for M6/M7).

## Tasks (output)

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | ADRs D28 bounded context map, D29 aggregate boundaries (own `Observation`, minimal `Property` + projections), D30 schema per context, D31 transactional outbox, D32 UUIDv7 (en + es) + ADR index | delegated (writer trigger: 2+ files) | [x] | 5fe38ce |
| T2 | Docs pages `architecture/context-map` (with SVG diagram component, like `IngestionFlowDiagram`) and `domain/aggregates` + `architecture/database-schema` (en + es); link from overview, domain page and relevant features | delegated | [x] | 4056280 |
| T3 | Conventions + skill alignment with M6/M7: handlers no longer publish to `EventBus`; write repositories persist pulled events into the outbox within the transaction; relay publishes through BullMQ; consumers idempotent via `processed_event`; UUIDv7 via `uuid` in `building-blocks`. Update `architecture/conventions` (en + es), D25/D24 consequences notes, `.claude/skills/house-radar-backend` (SKILL.md + templates) | delegated | [x] | 3db9484 |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`; diagram verified visually (headless Chrome, light/dark). TDD (D14) not applicable: documentation.

## Progress and verification

- T1 5fe38ce: ADRs D28-D32 (en + es) and both ADR indexes (D0 to D32).
- T2 4056280: `ContextMapDiagram.astro`, `architecture/context-map`, `domain/aggregates`, `architecture/database-schema` (en + es); linked from overview, ubiquitous language and HR-F001/F002/F005/F008. Diagram checked visually in headless Chrome (dark theme; text fits in boxes).
- T3 3db9484: conventions (en + es), D24/D25 superseded notes (en + es), `odd/tasks/code-conventions.md` update note, backend skill (SKILL.md 500 words; handler and spec templates without EventBus; new `write-repository` and `event-consumer` templates).
- Fix (parent review): aggregate event API `record`/`peekDomainEvents`/`clearDomainEvents` (+ `version`, `isNew()`), managed-entity write repositories, transport consumer + idempotent command handler via ports; commit recorded in git log as `docs: fix outbox templates and aggregate event api`.
- `pnpm docs:test`: 4 pass, 0 fail. `pnpm docs:check-i18n`: parity OK, 63 pages x 1 locale. `pnpm docs:check`: 0 errors, 0 warnings, 0 hints. `pnpm docs:build`: 127 pages built. Built `context-map` pages (en, es) contain `<svg` with `id="cmd-title"`.
- Not run: light-theme visual check; skill templates are illustrative and not compiled.

## Next step

Open the PR for `docs/data-model` (about 400+ changed lines: apply the delivery strategy, `ask-on-risk`).

- Review (skill-only slice of main..ef0b148; full branch exceeded the reviewer context budget): medium risk, consent granted, **approved and acknowledged**. Findings fixed: `markPersisted(version)` after commit (a second save of the same instance no longer fails the optimistic lock); write-repository comment no longer over-claims (failure guarantees asserted by the repository integration spec); out-of-order delivery guarded by `aggregate_version` + `projected_listing`; handler spec asserts events survive a failed save. Suggestion not applied: payload validation in the consumer (to be covered when the first consumer is implemented).
