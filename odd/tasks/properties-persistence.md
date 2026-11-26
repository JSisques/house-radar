# properties-persistence

Objective: schema, repositories and consumer wiring for the `properties` context (issue #48, S-M1-07).
Branch: `feat/properties-persistence`. Delivery: single PR. Test runner: vitest (`pnpm test`, `pnpm test:integration` in `apps/api`).

## Specs

- S1: "Migrations (`property`, `processed_event`, `outbox_event` if absent), entities, write/read repositories, wiring of the consumer to the relay; integration spec relay → consumer → table."
- S2: "Given an unpublished `ListingObserved`, When the relay runs, Then the property row exists."
- S3: "Given a processed event, When replayed, Then no second row is created."
- Out of scope: "Projections."
- Assumption: no read repository is added; nothing reads properties yet.

## Tasks

- [x] T1 (S1) inline: migration `property` + `property_listing`, schemas, mapper, write repository, `syncChildRows` hook in `OutboxWriteRepository`, `processed_event` adapter, module.
- [x] T2 (S1-S3) inline: `ListingObservedConsumer` + relay → consumer → table integration spec.
- [x] T3 (S1) inline: `database-schema.md` (EN + ES).
- [x] T4 (S1) inline: BullMQ `ListingEventsWorker` and `PropertiesModule` in `AppModule`.

## Log

- L1: "TEnemos que hacer esta issue en su propio worktree desde main (haz fetch primero) https://github.com/JSisques/house-radar/issues/48"
- `property_listing.applied_version` added: the aggregate keeps the applied event version per listing.
- Root row has no own state, so `updatedAt` is touched when a child changes to bump `version`.
- Eager `listings` collection broke optimistic locking (lock mode propagated to the child query): listings are populated explicitly.
- `createOrmOptions` now sets `contextName` per stream: with the shared default name, a consumer run inside the relay's transaction used the listings ORM context.
- User follow-up: "Si, hazlo en esta PR y cuando acabes crea la PR". Added `ListingEventsWorker` (BullMQ worker on `listings.events`) and imported `PropertiesModule` in `AppModule`.
- The worker closes with `close(true)`: a graceful close hung the app shutdown for 120s when Redis was unreachable (health and observability e2e specs).
- Risk: item 3 (shared `OutboxWriteRepository` hook is additive; `contextName` change affects every ORM, all integration specs pass).
