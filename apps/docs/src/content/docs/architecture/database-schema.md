---
title: Database schema
description: PostgreSQL schema per bounded context, layout rules and tables.
sidebar:
  order: 5
---

Decision [D30](/adr/d30-schema-per-context/): one PostgreSQL schema per bounded context, with the tables described below. Contexts are defined in [Context map](/architecture/context-map/) and aggregates in [Aggregates](/domain/aggregates/). The model is designed before the code; column details may be refined during implementation.

## Layout rules

- One schema per context: `ingestion`, `listings`, `properties`, `geography`, `identity`, `users`.
- No foreign keys across schemas: contexts reference each other by ID. Foreign keys are allowed inside a schema. Cross-context reads go through projections, never cross-schema `JOIN`s.
- Each context owns its migrations and permissions.
- Primary keys are `uuid` v7 ([D32](/adr/d32-uuid-v7/)), unless stated otherwise. Mutable rows have `created_at` and `updated_at timestamptz not null`; append-only tables have `created_at` only.
- Money is `bigint` cents. Locations are `geography(Point, 4326)` (radius in metres with `ST_DWithin`). Municipality boundaries are `geometry(MultiPolygon, 4326)`.
- Unknown values are `NULL`, plus an origin column (`declared`, `calculated`, `inferred`) where the origin matters.
- Enums are `text` with `check` constraints (closed catalogs from the feature specs).

## Tables

### `ingestion`

Sources, runs and extraction errors ([D23](/adr/d23-ingestion-concurrency-model/)).

#### `ingestion.source`

Mutable.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key, for example `idealista`, `manual`. |
| `kind` | `text not null` | `api`, `feed` or `manual` (check). |
| `enabled` | `boolean not null` | Whether the source is ingested. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

#### `ingestion.ingestion_run`

One execution of a source.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `source_id` | `text not null` | Source reference (same schema). |
| `started_at` | `timestamptz not null` | Start time. |
| `finished_at` | `timestamptz null` | End time. |
| `status` | `text not null` | `running`, `succeeded`, `partial` or `failed` (check). |
| `discovered_count` | `int not null` | Listings discovered. |
| `processed_count` | `int not null` | Listings processed. |
| `failed_count` | `int not null` | Listings failed. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

Constraints and indexes:

- Index `(source_id, started_at desc)`.

#### `ingestion.extraction_error`

Append-only; has no `updated_at`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `run_id` | `uuid not null` | Run that produced the error (same schema). |
| `external_id` | `text null` | External ID of the listing, when known. |
| `message` | `text not null` | Error description. |
| `occurred_at` | `timestamptz not null` | When the error happened. |
| `created_at` | `timestamptz not null` | Row creation time. |

Constraints and indexes:

- Index `(run_id)`.

Also has: `outbox_event` (see below).

### `listings`

Listings, their observations and corrections ([D29](/adr/d29-aggregate-boundaries/)).

#### `listings.listing`

Current state of the advertisement. Unknown values are `NULL`; `<attr>_origin` (`declared`, `calculated`, `inferred`) is added where the origin matters ([D20](/adr/d20-listing-consolidation-rules/)).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `source_id` | `text not null` | Provenance: source (reference by ID, no foreign key across schemas). |
| `external_id` | `text null` | Provenance: ID in the source. |
| `url` | `text not null` | Provenance: original URL. |
| `normalized_url` | `text not null` | Normalized URL. |
| `property_type` | `text null` | Declared attribute, closed catalog (check). |
| `condition` | `text null` | Declared attribute, closed catalog (check). |
| `built_area_m2` | `numeric null` | Built area. |
| `usable_area_m2` | `numeric null` | Usable area. |
| `plot_area_m2` | `numeric null` | Plot area. |
| `bedrooms` | `int null` | Number of bedrooms. |
| `bathrooms` | `int null` | Number of bathrooms. |
| `year_built` | `int null` | Year of construction. |
| `has_garage, has_garden, has_pool, has_terrace, has_balcony, has_elevator, has_heating` | `boolean null` | Nullable features: `NULL` means unknown, not "no". |
| `energy_certificate` | `text null` | Energy certificate label. |
| `title` | `text null` | Listing title. |
| `description` | `text null` | Listing description. |
| `location` | `geography(Point,4326)` | Pin of the listing. |
| `location_precision` | `text not null` | `exact`, `approximate` or `municipality` ([D18](/adr/d18-location-pin-declared-precision/)). |
| `postal_code` | `text null` | Entered by hand. |
| `current_price_cents` | `bigint` | Current price in cents. |
| `status` | `text not null` | `active`, `disappeared` or `unknown` (check). |
| `missed_runs` | `int not null` | Consecutive runs without seeing the listing. |
| `published_at` | `timestamptz null` | Publication date, if known. |
| `first_seen_at` | `timestamptz not null` | First observation. |
| `last_checked_at` | `timestamptz not null` | Last observation or check. |
| `version` | `int not null` | Optimistic locking ([D23](/adr/d23-ingestion-concurrency-model/)). |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

Constraints and indexes:

- Unique `(source_id, external_id)` where `external_id is not null`.
- Unique `(normalized_url)` for manual listings.
- GiST index on `location`.

#### `listings.observation`

Append-only; has no `updated_at`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `listing_id` | `uuid not null` | Observed listing (same schema). |
| `run_id` | `uuid null` | Run that produced it; `NULL` for manual checks (reference by ID, no foreign key across schemas). |
| `price_cents` | `bigint not null` | Observed price in cents. |
| `status` | `text not null` | Observed status. |
| `observed_at` | `timestamptz not null` | Observation date. |
| `created_at` | `timestamptz not null` | Row creation time. |

Constraints and indexes:

- Unique `(listing_id, run_id)` where `run_id is not null`.
- Index `(listing_id, observed_at)`.

#### `listings.listing_correction`

Audit of descriptive corrections; append-only.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `listing_id` | `uuid not null` | Corrected listing. |
| `field` | `text not null` | Corrected field. |
| `old_value` | `text null` | Previous value. |
| `new_value` | `text null` | New value. |
| `corrected_at` | `timestamptz not null` | Correction time. |
| `created_at` | `timestamptz not null` | Row creation time. |

Also has: `outbox_event` (see below).

### `properties`

Properties, duplicate candidates and projections ([D29](/adr/d29-aggregate-boundaries/)).

#### `properties.property`

Minimal aggregate.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `chosen_location` | `geography(Point,4326)` | Chosen location. |
| `chosen_location_precision` | `text not null` | Precision of the chosen location. |
| `version` | `int not null` | Optimistic locking. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

#### `properties.property_listing`

Membership of listings in properties.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `property_id` | `uuid not null` | Foreign key to `property` (same schema). |
| `listing_id` | `uuid not null` | Listing (reference by ID, no foreign key across schemas). Unique: a listing belongs to exactly one property. |
| `created_at` | `timestamptz not null` | Row creation time. |

Constraints and indexes:

- Unique `(listing_id)`.

#### `properties.duplicate_candidate`

Pair of listings that may be the same property ([D21](/adr/d21-duplicate-detection-policy/)).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `listing_a_id` | `uuid not null` | First listing of the ordered pair (`a < b`). |
| `listing_b_id` | `uuid not null` | Second listing of the ordered pair. |
| `status` | `text not null` | `suggested`, `linked` or `dismissed` (check). |
| `reason` | `text not null` | Why it was suggested. |
| `resolved_at` | `timestamptz null` | Resolution time. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

Constraints and indexes:

- Check `listing_a_id < listing_b_id`.
- Unique `(listing_a_id, listing_b_id)`.

#### `properties.property_search_view`

Projection used by search, detail and dashboard ([D19](/adr/d19-search-read-model/)); rebuildable from events.

| Column | Type | Notes |
| --- | --- | --- |
| `property_id` | `uuid` | Primary key. |
| (consolidated attributes) | `several` | Property type, areas, bedrooms, bathrooms, features and so on, consolidated across listings. |
| `conflicts` | `jsonb` | Attribute conflicts with each value and its source ([D20](/adr/d20-listing-consolidation-rules/)). |
| `representative_price_cents` | `bigint null` | Lowest price among active listings. |
| `active_listing_count` | `int not null` | Active listings. |
| `listing_count` | `int not null` | All listings. |
| `municipality_code` | `text` | INE code (reference by ID). |
| `province_code` | `text` | Province code (reference by ID). |
| `location` | `geography` | Chosen location. |
| `location_precision` | `text` | Precision. |
| `price_per_m2_cents` | `bigint null` | Calculated on built area only. |
| `first_seen_at` | `timestamptz` | Earliest listing observation. |
| `last_updated_at` | `timestamptz` | Last projection update. |

Constraints and indexes:

- GiST index on `location`.
- B-tree indexes on price, areas, type and municipality.

#### `properties.property_price_point`

Projection: evolution of the lowest active price.

| Column | Type | Notes |
| --- | --- | --- |
| `property_id` | `uuid not null` | Property. |
| `observed_at` | `timestamptz not null` | Point in time. |
| `lowest_active_price_cents` | `bigint` | Lowest price among active listings at that time. |

Constraints and indexes:

- Index `(property_id, observed_at)`.

Also has: `processed_event`, `outbox_event` (see below).

### `geography`

Read-only reference data loaded from IGN.

#### `geography.province`

Provinces.

| Column | Type | Notes |
| --- | --- | --- |
| `code` | `text` | Primary key. |
| `name` | `text not null` | Province name. |

#### `geography.municipality`

Municipalities.

| Column | Type | Notes |
| --- | --- | --- |
| `code` | `text` | Primary key, INE code. |
| `name` | `text not null` | Municipality name. |
| `province_code` | `text not null` | Province (same schema). |
| `boundary` | `geometry(MultiPolygon,4326)` | Boundary for point-in-polygon. |

Constraints and indexes:

- GiST index on `boundary`.

### `identity`

Accounts ([D13](/adr/d13-users-and-authentication/)).

#### `identity.account`

Mutable.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `email` | `text not null` | Lower-cased; unique. |
| `password_hash` | `text not null` | Password hash. |
| `role` | `text not null` | Single role for now (check). |
| `failed_sign_in_attempts` | `int not null` | Consecutive failures. |
| `locked_until` | `timestamptz null` | Lock expiry. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

Constraints and indexes:

- Unique `(email)`.

Also has: `outbox_event` (see below).

### `users`

Profiles, favorites and saved searches.

#### `users.user_profile`

Mutable.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key; equals the account ID (reference by ID). |
| `time_zone` | `text not null` | IANA time zone. |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

#### `users.favorite`

A user's favorite property.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `user_id` | `uuid not null` | User profile (same schema). |
| `property_id` | `uuid not null` | Property (reference by ID, no foreign key across schemas). |
| `created_at` | `timestamptz not null` | Row creation time. |

Constraints and indexes:

- Unique `(user_id, property_id)`.

#### `users.saved_search`

Saved search filters.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (UUIDv7). |
| `user_id` | `uuid not null` | User profile (same schema). |
| `name` | `text not null` | Search name. |
| `filters` | `jsonb not null` | Search params (same shape validated by the router). |
| `created_at` | `timestamptz not null` | Row creation time. |
| `updated_at` | `timestamptz not null` | Last update time. |

Constraints and indexes:

- Unique `(user_id, name)`.

Also has: `processed_event` (see below).

## Outbox

Every schema that emits events (`ingestion`, `listings`, `properties`, `identity`) has an `outbox_event` table ([D31](/adr/d31-transactional-outbox/)). The write repository inserts the aggregate's pulled events in the same transaction; a relay publishes unpublished rows through BullMQ and sets `published_at`. The table is also an auditable event log that can be replayed to rebuild projections.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key; equals the event ID (UUIDv7). |
| `aggregate_type` | `text not null` | Type of the emitting aggregate. |
| `aggregate_id` | `uuid not null` | Emitting aggregate. |
| `event_type` | `text not null` | Event name, for example `ListingPriceChanged`. |
| `schema_version` | `int not null` | Version of the payload schema. |
| `payload` | `jsonb not null` | Event data. |
| `metadata` | `jsonb not null` | Correlation and causation IDs. |
| `occurred_at` | `timestamptz not null` | When the event occurred. |
| `published_at` | `timestamptz null` | `NULL` until the relay publishes it. |

Constraints and indexes:

- Partial index on `occurred_at` where `published_at is null`.

## Processed events

`properties` and `users` consume events, so each has a `processed_event` table that makes consumers idempotent: a consumer inserts `(event_id, consumer)` and skips the event if it already exists.

| Column | Type | Notes |
| --- | --- | --- |
| `event_id` | `uuid not null` | ID of the processed event. |
| `consumer` | `text not null` | Name of the consumer. |
| `processed_at` | `timestamptz not null` | Processing time. |

Constraints and indexes:

- Primary key `(event_id, consumer)`.
