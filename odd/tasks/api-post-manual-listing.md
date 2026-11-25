# Feature: api-post-manual-listing

Objective: issue #46 `[M1] API: POST manual listing endpoint` (S-M1-05, parent #4). Branch `feat/api-post-manual-listing`. Delivery: ask-on-risk. Test runner: Vitest (`pnpm --filter @house-radar/api test` / `test:e2e`).

## Specs

- S1. "Given a valid body, When posted, Then 201 with the listing/property reference is returned."
- S2. "Given missing fields, When posted, Then 400 lists the missing fields (HR-F001-AC2)."
- S3. "Given a duplicate normalized URL, When posted, Then 409 with the existing listing reference (HR-F001-AC12)."
- S4. Scope: "Controller + DTOs + class-validator, mapping of domain exceptions to 400/409, OpenAPI documentation, e2e spec."
- S5. Out of scope: "Web form (#52)."
- S6. Follow-up decision (comment on #46): command keeps primitives; per the user, "un servicio de assert que sea llamado por el handler" with dependency injection validates the required fields and accumulates them. Conventions must state this.
- S7. (Assumption, needed by S1-S3 e2e) No Nest runtime wiring exists for any context (no MikroORM module, `ListingsModule`, `IngestionModule`); it is added here, minimal.

## Tasks

- T1. S6, S2, S3: assert service + typed exceptions (400/409 with details), handler returns `{ id }`, error body carries details. Route: inline. Commit: 4eea716 (done).
- T2. S7: MikroORM runtime module + `ListingsModule` + `IngestionModule`, registered in `AppModule`. Route: inline. Commit: e5ec4b5 (done).
- T3. S1-S4: controller, DTOs, class-validator pipe, OpenAPI, e2e spec. Route: inline. Commit: pending.
- T4. S6: conventions docs (en + es). Route: inline. Commit: pending.

## Log

- L1 (2026-11-25, user): "TEnemos que hacer esta issue en su propio worktree desde main (haz fetch primero) https://github.com/JSisques/house-radar/issues/46"
- L2 (2026-11-25, user): "Podemos hacer un servicio de assert que sea llamado por el handler y usaríamos  depndecy injection"
- L3: Exploration: handler `ImportManualListingHandler` exists (#45), returns `created|duplicate|invalid` results; no controller/module/class-validator. Filter `AllExceptionsFilter` flattens to `{statusCode, code, message}`, so exception mappings need optional `details`.
