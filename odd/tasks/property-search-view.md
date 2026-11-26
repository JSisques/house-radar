# property-search-view

Objective: `property_search_view` read model in the `properties` context (issue #49, S-M1-08, D19, D20).
Branch: `feat/api-property-search-view`. Delivery: single PR. Test runner: vitest (`pnpm test`, `pnpm test:integration` in `apps/api`).

## Specs

- S1: "`property_search_view` projection updated from listing events: most recent observed value per attribute, conflict flag with each value and source, representative price = lowest active price, price per m2 from built area only, rebuildable."
- S2: "Given two active listings at 200 000 and 190 000, When read, Then the representative price is 190 000 (HR-F002-AC8)."
- S3: "Given built areas 100 and 105 in two listings, When read, Then the latest value is shown and the conflict listed with sources (HR-F002-AC7)."
- S4: "Given a listing with only usable area, When read, Then price per m2 is Unknown (HR-F002-AC4)."
- S5: "Given a listing that disappears, When projected, Then it no longer counts toward the price and observations remain (HR-F002-AC9)."
- Out of scope: "Search filters (M2); history series (M3)."
- Decision (confirmed by the user, "Si"): `ListingObserved` only carries price, status and an untyped snapshot, so attributes and source come from `ListingImported`. The projection consumes both.

## Tasks

- [x] T1 (S1-S5) inline: pure consolidation service and listing attribute reader (consolidation spec observed RED then GREEN; reader spec written together with the reader).
- [x] T2 (S1-S5) inline: ports, commands, handlers, refresher and rebuild command (handler specs written after the handlers).
- [x] T3 (S1-S5) inline: migration, schemas, repositories, consumer wiring, integration spec relay to view, database-schema docs (EN + ES).

## Log

- L1: "TEnemos que hacer esta issue en su propio worktree desde main (haz fetch primero) https://github.com/JSisques/house-radar/issues/49"
- L2: "Sigue" (after the exploration summary).
- Exploration: `properties` holds `property` + `property_listing` (1:1 with listings for now). `ListingObserved` payload = observation (`price`, `status`, `observedAt`, `snapshot`); `ListingImported` payload = full listing primitives (source, attributes, price, status). No `ListingDisappeared` event exists yet, so disappearance arrives as an observation with status `disappeared`.
- L3: "Si" (consume `ListingImported` as well).
- Design: `projected_listing` keeps the per-listing state (price/status ordered by `state_observed_at`, attributes by `attributes_observed_at` = `lastCheckedAt`); `aggregate_version` is not used because `Listing` and `Observation` are different aggregates. `property_search_view` is recomputed per property by a pure service; rebuild = `RebuildPropertySearchViewCommand`.
- The consumer dispatches `CreatePropertyFromListingObserved` and then `ProjectListingObserved`, so the property exists when the view is refreshed. A listing imported before it has a property is stored and shows up when the property is created.
- Docs: `projected_listing.property_id` and `version` dropped from the documented design (membership lives in `property_listing`); location columns and `first_seen_at` deferred.
- Evidence: `pnpm exec vitest run` 124 passed; integration 68 passed (Docker); eslint clean on `src/contexts/properties`.
- Risk: none (additive tables; the consumer now also reads `ListingImported` and requires `status` and `observedAt` on `ListingObserved`, which the observation payload always carries).
- Review round 1 (PR #204): rebuild uses Promise.all; the in-memory test helper in src was removed (handler specs use manual mocks). Conventions audit: commands carry primitives with {Name}CommandInput; one type per file; consolidation and refresher live in application/services/write; the payload reader became ListingEventPayloadMapper (infrastructure); the read model shape is a .view-model; specs follow one describe per class and one nested describe per method.
- Review round 2: reads and the view upsert go through the ORM (schemas export entity names, bigint and decimal map to number, explicit field names for the M2 columns); only the two guarded upserts of projected_listing stay SQL, documented in the repository. MikroORM onConflictWhere could express the guards as two upserts per event; not adopted to keep each event one atomic statement.
Review round 3: type guards (isRecord, asString, asNumber) moved to building-blocks with specs; attribute name catalogs moved to shared-kernel (note: only properties uses them today, listings does not yet); ACTIVE_LISTING_STATUS in its own constants file; price per m2 in its own service on top of the shared-kernel PricePerSquareMeter; IAttributeObservation in its own file; consolidation service is injectable.
