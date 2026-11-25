# Listings persistence (issue #44)

Objective: migration, MikroORM row schemas, mappers and outbox-based repositories for `listings.listing` and `listings.observation`.
Branch: feat/listings-persistence. Delivery: ask-on-risk. Test runner: vitest (`pnpm test:integration` in apps/api).

## Specs

- S1: Migration for `listings.listing` and `listings.observation` per `architecture/database-schema.md` (only columns the aggregates model, plus `version`, `created_at`, `updated_at`; `observation.snapshot jsonb`).
- S2: MikroORM row schemas and mappers between aggregates and rows.
- S3: Listing write repository on the outbox base with unique `(source, external_id)` upsert and optimistic version.
- S4: Observation write repository (append-only, unique `(listing_id, run_id)`), minimal read repository, integration specs on Testcontainers.
- S5: "Given source+external id that exist, When ingested again, Then listing updated and none created (HR-F001-AC3)".
- S6: "Given a saved listing, When read back, Then equals original aggregate."
- S7: "Given a save, When committed, Then `ListingObserved` is in the outbox."
- Out of scope: use cases and endpoints.

## Tasks

- T1 (S1, S2): migration + row schemas + mappers — inline — pending
- T2 (S3, S5, S6): listing write repository with upsert — inline — pending
- T3 (S4, S7): observation write + read repositories — inline — pending
- T4: docs (database-schema.md + ES mirror) — inline — pending

## Log

- L1 (2026-11-25): "TEnemos que hacer esta issue en su propio worktree desde main (haz fetch primero) https://github.com/JSisques/house-radar/issues/44"
