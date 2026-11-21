# Roadmap issue plan

Plan of every GitHub label, milestone and issue (R2, R3). Created on GitHub on 2026-11-20; see section 6 for the plan ID → issue mapping.

Conventions: one slice = one vertical, reviewable PR of about 400 authored changed lines (planning heuristic, not a cap), built with strict TDD (D14). Docs paths are relative to `apps/docs/src/content/docs/`. Slices flagged **Needs definition before starting** must be clarified before work begins.

## 1. Labels

| Name | Color | Description |
|---|---|---|
| `type:feature` | `1D76DB` | User-facing feature slice |
| `type:foundation` | `5319E7` | Technical foundation or release work |
| `type:docs` | `0E8A16` | Documentation |
| `P0` | `B60205` | Priority P0: core of the MVP |
| `P1` | `D93F0B` | Priority P1 |
| `P2` | `FBCA04` | Priority P2: post-1.0 or low urgency |
| `app:api` | `C5DEF5` | apps/api |
| `app:web` | `C5DEF5` | apps/web |
| `app:ingestion` | `C5DEF5` | apps/ingestion |
| `app:docs` | `C5DEF5` | apps/docs |
| `pkg:building-blocks` | `BFD4F2` | packages/building-blocks |
| `pkg:shared-kernel` | `BFD4F2` | packages/shared-kernel |
| `infra` | `FEF2C0` | Tooling, CI, Docker, observability, deployment |
| `ctx:ingestion` | `D4C5F9` | Bounded context ingestion |
| `ctx:listings` | `D4C5F9` | Bounded context listings |
| `ctx:properties` | `D4C5F9` | Bounded context properties |
| `ctx:geography` | `D4C5F9` | Bounded context geography |
| `ctx:identity` | `D4C5F9` | Bounded context identity |
| `ctx:users` | `D4C5F9` | Bounded context users |
| `parent` | `000000` | Parent issue grouping slices |

## 2. Milestones

| Title | Description |
|---|---|
| M0 · Foundation | Monorepo ready to write code with TDD: tooling, building-blocks, shared-kernel, app skeletons, Docker Compose, outbox + relay, observability baseline, release tooling. |
| M1 · Walking skeleton | Cross every layer with one real flow: manual import, Listing + Observation, Property 1:1, detail page, basic list. |
| M2 · Search & map | The real search: geography (IGN import), all filters, typed URL, MapLibre map with clustering. |
| M3 · History & duplicates | The differentiating value: check listing, history and chart, disappeared listings, duplicate candidates and resolution. |
| M4 · Users | Complete personal product: auth with seeded account, favorites, saved searches, preferences; deployment to the own server and backups. |
| M5 · Automated ingestion | Data without manual work: idealista connector (if key granted), runs, retries, automatic disappearance, ingestion panel and alerts. |
| M6 · Dashboard → Release 1.0 | Close the MVP: statistics and dashboard, runbooks, acceptance of the product scope and the 1.0.0 cut. |

## 3. Parent issues

### FOUNDATION

- Summary: tooling, shared packages, app skeletons, infrastructure, observability baseline, release tooling and release closing work, so that features are written under the agreed rules.
- Docs page: `architecture/conventions.md`, `architecture/overview.md`, `operations/overview.md`
- Priority: P0
- Milestone: M0 · Foundation (deployment and backups S-M4-15, S-M4-16 in M4; runbooks and the 1.0 cut S-M6-08, S-M6-09 in M6)
- Labels: `type:foundation` `parent` `P0`

### HR-F001 · Listing ingestion

- Summary: Listing ingestion; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f001-ingestion.md`
- Priority: P0
- Milestone: M1 · first slice milestone (HR-F001 manual in M1; automatic in M5)
- Labels: `type:feature` `parent` `ctx:ingestion` `ctx:listings` `P0`
- Slices: S-M1-02, S-M1-03, S-M1-04, S-M1-05, S-M1-11, S-M1-14, S-M3-01, S-M5-01, S-M5-03, S-M5-04, S-M5-05, S-M5-06, S-M5-07, S-M5-08, S-M5-09, S-M5-10

### HR-F002 · Listing normalization

- Summary: Listing normalization; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f002-normalization.md`
- Priority: P0
- Milestone: M1 · first slice milestone
- Labels: `type:feature` `parent` `ctx:listings` `ctx:geography` `P0`
- Slices: S-M1-01, S-M1-06, S-M1-07, S-M1-08, S-M2-01, S-M2-02

### HR-F003 · Search and filters

- Summary: Search and filters; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f003-search.md`
- Priority: P0
- Milestone: M2 · first slice milestone
- Labels: `type:feature` `parent` `ctx:properties` `P0`
- Slices: S-M1-13, S-M2-06, S-M2-07, S-M2-08, S-M2-09, S-M2-10, S-M2-11, S-M2-12, S-M2-13

### HR-F004 · Property detail

- Summary: Property detail; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f004-property-detail.md`
- Priority: P0
- Milestone: M1 · first slice milestone (basic in M1; location, history, duplicates and actions land in later milestones)
- Labels: `type:feature` `parent` `ctx:properties` `P0`
- Slices: S-M1-09, S-M1-10, S-M1-12, S-M3-02, S-M3-03, S-M3-04

### HR-F005 · Duplicate detection

- Summary: Duplicate detection; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f005-duplicates.md`
- Priority: P0
- Milestone: M3 · first slice milestone
- Labels: `type:feature` `parent` `ctx:properties` `P0`
- Slices: S-M3-09, S-M3-10, S-M3-11, S-M3-12, S-M3-13, S-M3-14

### HR-F006 · Map

- Summary: Map; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f006-map.md`
- Priority: P1
- Milestone: M2 · first slice milestone
- Labels: `type:feature` `parent` `app:web` `P1`
- Slices: S-M2-03, S-M2-04, S-M2-05, S-M2-14, S-M2-15, S-M2-16

### HR-F007 · Favorites and saved searches

- Summary: Favorites and saved searches; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f007-favorites-saved-searches.md`
- Priority: P1
- Milestone: M4 · first slice milestone
- Labels: `type:feature` `parent` `ctx:users` `P1`
- Slices: S-M4-09, S-M4-10, S-M4-11, S-M4-12, S-M4-13, S-M4-14

### HR-F008 · Price history

- Summary: Price history; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f008-price-history.md`
- Priority: P0
- Milestone: M3 · first slice milestone
- Labels: `type:feature` `parent` `ctx:listings` `ctx:properties` `P0`
- Slices: S-M3-05, S-M3-06, S-M3-07, S-M3-08

### HR-F009 · Dashboard

- Summary: Dashboard; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f009-dashboard.md`
- Priority: P1
- Milestone: M6 · first slice milestone
- Labels: `type:feature` `parent` `ctx:properties` `P1`
- Slices: S-M6-01, S-M6-02, S-M6-03, S-M6-04, S-M6-05, S-M6-06, S-M6-07

### HR-F010 · Users and authentication

- Summary: Users and authentication; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f010-users.md`
- Priority: P1
- Milestone: M4 · first slice milestone
- Labels: `type:feature` `parent` `ctx:identity` `ctx:users` `P1`
- Slices: S-M4-01, S-M4-02, S-M4-03, S-M4-04, S-M4-05, S-M4-06, S-M4-07, S-M4-08

### HR-F011 · Notifications

- Summary: alerts per saved search (new listing, price drop, important change), in-app notifications, email port without mandatory adapter. Post-1.0.
- Docs page: `features/hr-f011-notifications.md`
- Priority: P2
- Milestone: none (post-1.0)
- Labels: `type:feature` `parent` `ctx:users` `P2`
- Slices: none planned (outside Release 1.0).

### HR-F012 · Administration and observability

- Summary: Administration and observability; see the feature page for business rules and acceptance criteria.
- Docs page: `features/hr-f012-admin-observability.md`
- Priority: P1 (admin area slices P2)
- Milestone: M5 · first slice milestone
- Labels: `type:feature` `parent` `app:ingestion` `app:api` `P1`
- Slices: S-M5-02, S-M5-11, S-M5-12, S-M5-13, S-M5-14, S-M5-15, S-M5-16, S-M5-17

## 4. Slice issues

### M0 · Foundation

#### S-M0-01 · [M0] Turborepo and pnpm workspace scripts

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: none

**Goal.** A workspace where every app and package runs the same scripts through Turborepo with caching.

**Scope.** Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` (strict); `apps/*` and `packages/*` globs; root scripts `lint`, `typecheck`, `test`, `build`, `dev`; a placeholder package proving task pipelines (`building-blocks` empty shell).

**Acceptance criteria**

- Given a fresh clone, When `pnpm install && pnpm turbo run build typecheck` runs, Then all workspaces execute in dependency order and a second run is served from cache.
- Given a package with a strict TypeScript error, When `pnpm typecheck` runs, Then it fails and names the package.
- Given `apps/docs`, When the pipeline runs, Then it is a workspace member and its existing scripts keep working.

**Out of scope.** ESLint, Prettier, hooks, CI, Docker.

**References.** `architecture/conventions.md` (Tooling), D2, D16.

#### S-M0-02 · [M0] ESLint flat config with boundaries and import sorting

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-01

**Goal.** Lint rules turn the architecture conventions into errors.

**Scope.** `eslint.config.js` (flat) shared by all workspaces; `eslint-plugin-boundaries` layer rules (domain, application, infrastructure, transport; context isolation); `@typescript-eslint/no-explicit-any`; `no-restricted-imports` for `../`; `eslint-plugin-simple-import-sort` groups (built-ins, external, `@house-radar/*`, aliases, relative); one intentionally broken fixture per rule used by a lint test.

**Acceptance criteria**

- Given a domain file importing from infrastructure, When ESLint runs, Then it fails with a boundaries error.
- Given a file importing `../x`, When ESLint runs, Then it fails.
- Given unsorted imports, When `eslint --fix` runs, Then they are ordered per the convention.
- Given `any` in a type, When ESLint runs, Then it fails.

**Out of scope.** Prettier, hooks, commitlint; per-app layer folders (created when apps appear).

**References.** `architecture/conventions.md` (Tooling, Layers), D16, D25.

#### S-M0-03 · [M0] Prettier, husky, lint-staged and commitlint

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-02

**Goal.** Formatting and commit hygiene enforced locally before CI.

**Scope.** `.prettierrc` (`singleQuote`, `trailingComma: all`), `.prettierignore`; husky `pre-commit` (lint-staged: ESLint + Prettier on staged files) and `commit-msg` (commitlint with `@commitlint/config-conventional`); scripts `format`, `format:check`.

**Acceptance criteria**

- Given a staged badly formatted file, When committing, Then lint-staged fixes it or blocks the commit.
- Given a message `update stuff`, When committing, Then commitlint rejects it.
- Given `feat(api): add x`, When committing, Then it is accepted.

**Out of scope.** CI wiring (S-M0-05).

**References.** `architecture/conventions.md` (Tooling), D16.

#### S-M0-04 · [M0] Vitest baseline and test conventions

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-01

**Goal.** One test runner configuration for unit, component and integration specs, ready for strict TDD.

**Scope.** Vitest workspace config; naming (`*.spec.ts`, `*.spec.tsx`, `*.integration-spec.ts`, `*.e2e-spec.ts`); coverage reporter; `test`, `test:integration` scripts and turbo tasks; sample spec per kind in a scratch package to prove discovery.

**Acceptance criteria**

- Given a `*.spec.ts` next to code, When `pnpm test` runs, Then it is discovered and executed.
- Given an integration spec, When `pnpm test` runs, Then it is excluded and runs only with `test:integration`.
- Given a failing spec, When the task runs, Then turbo reports non-zero exit.

**Out of scope.** Testcontainers helpers (S-M0-13); Playwright (S-M1-17).

**References.** `architecture/conventions.md` (Testing), D14.

#### S-M0-05 · [M0] CI workflow for code: lint, typecheck, test, build affected

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-03, S-M0-04

**Goal.** Every pull request is checked automatically on affected workspaces.

**Scope.** `.github/workflows/ci.yml`: install with cache, `turbo run lint typecheck test build --filter=...[origin/main]`, format check, commitlint over PR commits; required-check names documented; runs on PR and push to `main`.

**Acceptance criteria**

- Given a PR touching only `apps/docs`, When CI runs, Then only affected tasks execute.
- Given a lint error, When CI runs, Then the workflow fails.
- Given a PR with a non-conventional commit, When CI runs, Then commitlint fails.

**Out of scope.** Docker image build (S-M0-26); release automation (S-M0-06).

**References.** `architecture/conventions.md` (Tooling), D16.

#### S-M0-06 · [M0] release-please with a single product version

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-05

**Goal.** One SemVer product version for the whole monorepo, with a human-gated Release PR (R4, R5).

**Scope.** `.github/workflows/release-please.yml`; `release-please-config.json` (single root package, `bump-minor-pre-major: true`, `changelog-path: CHANGELOG.md`, `include-component-in-tag: false`); `.release-please-manifest.json` at `0.0.0`; internal packages stay `private` and follow the product version; document how to cut a release.

**Acceptance criteria**

- Given a `feat` commit merged to `main`, When release-please runs, Then a Release PR is opened with the minor bump and a changelog entry.
- Given a breaking change before 1.0, When release-please runs, Then the minor (not major) is bumped.
- Given the Release PR is merged, When the action completes, Then tag `vX.Y.Z`, a GitHub Release and updated `CHANGELOG.md` exist.

**Out of scope.** Docker tagging (S-M0-26); the ADR D33 text (docs output of the roadmap feature).

**References.** `odd/tasks/roadmap.md` R4, R5; D16.

#### S-M0-07 · [M0] building-blocks: value object base and generic value objects

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `pkg:building-blocks` `P0`
- Depends on: S-M0-04

**Goal.** The base every value object extends, plus the six option-configured generic value objects.

**Scope.** `packages/building-blocks/src/domain/value-objects/`: `ValueObject` base (mandatory `validate()`, `toPrimitives()`, equality); `StringValueObject`, `NumberValueObject`, `UuidValueObject`, `EnumValueObject`, `DateValueObject` (rejects invalid dates, defensive copy), `BooleanValueObject`; one typed exception per VO, each with spec.

**Acceptance criteria**

- Given an invalid option set, When a generic VO is built, Then its typed exception with a `code` is thrown.
- Given a `DateValueObject`, When its source Date is mutated, Then the VO value is unchanged.
- Given two VOs with equal primitives, When compared, Then `equals` is true.
- Given the package, When built, Then it has no framework dependency.

**Out of scope.** Aggregates, repositories, UUID generation.

**References.** `architecture/conventions.md` (building-blocks), D24.

#### S-M0-08 · [M0] building-blocks: aggregate root, domain events and exceptions

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `pkg:building-blocks` `P0`
- Depends on: S-M0-07

**Goal.** The aggregate base with its own event buffer and optimistic-locking state.

**Scope.** `AggregateRoot` (`record`, `peekDomainEvents`, `clearDomainEvents`, `version`, `isNew()`, `markPersisted(version)`); domain event envelope (`schemaVersion`, `correlationId`, `causationId`, `occurredAt`) and `generateEventMetadata()`; `DomainException` (`code`, `cause`); `FieldIsRequiredException`.

**Acceptance criteria**

- Given a new aggregate, When created, Then `isNew()` is true and `version` is 0.
- Given recorded events, When `peekDomainEvents` is called twice, Then the buffer is not drained.
- Given `markPersisted(3)`, When called, Then `isNew()` is false and `version` is 3.
- Given `clearDomainEvents`, When called, Then the buffer is empty.

**Out of scope.** Persistence, outbox (S-M0-17).

**References.** `architecture/conventions.md` (Domain model), D23, D24, D29, D31.

#### S-M0-09 · [M0] building-blocks: repository ports, criteria, builder factory and UUIDv7

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `pkg:building-blocks` `P0`
- Depends on: S-M0-08

**Goal.** Contracts the contexts implement for reads, writes and queries, plus ID generation.

**Scope.** Separate read and write repository ports; immutable `Criteria`, `Filter` (no `any`), `PaginatedResult`, `FilterFieldRegistry`; builder base and `IBuilderFactory<TBuilder>`; UUIDv7 via `uuid` `v7()` usable in Node and browser.

**Acceptance criteria**

- Given a `Criteria`, When a filter is added, Then a new instance is returned and the original is unchanged.
- Given a builder missing a required field, When `validate()` runs, Then `FieldIsRequiredException` is thrown.
- Given two UUIDv7 generated in order, When sorted, Then order is preserved.
- Given the package, When bundled for a browser, Then it builds without Node-only imports.

**Out of scope.** Concrete repositories (per context).

**References.** `architecture/conventions.md` (building-blocks, Persistence), D24, D32.

#### S-M0-10 · [M0] shared-kernel: Money, Area, price per square meter and data origin

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `pkg:shared-kernel` `P0`
- Depends on: S-M0-09

**Goal.** Cross-context value types for amounts and the known/unknown model.

**Scope.** `Money` (EUR, integer cents), `Area` (m2), `PricePerSquareMeter` (built area only), `Known<T> | Unknown` with origin (declared, calculated, inferred) and helpers.

**Acceptance criteria**

- Given built area 100 m2 and price 200 000 EUR, When price per m2 is computed, Then it is 2 000 EUR/m2 marked calculated (HR-F002-AC3).
- Given no built area, When price per m2 is requested, Then Unknown is returned (HR-F002-AC4).
- Given an unknown year, When modeled, Then it is Unknown and never 0 or empty (HR-F002-AC2).

**Out of scope.** Geo and catalogs (S-M0-11).

**References.** `architecture/conventions.md` (shared-kernel), `features/hr-f002-normalization.md`, D20.

#### S-M0-11 · [M0] shared-kernel: geo, catalogs, provenance and cross-context identities

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `pkg:shared-kernel` `P0`
- Depends on: S-M0-10

**Goal.** The remaining shared value objects used by two or more contexts.

**Scope.** `GeoPoint`, `LocationPrecision` (`exact|approximate|municipality`), `MunicipalityCode`; closed catalogs `PropertyType`, `PropertyCondition`, `EnergyCertificate`; `SourceId`, `ExternalId`, `ListingUrl` (strip query string and fragment); `PropertyId`, `ListingId`.

**Acceptance criteria**

- Given `https://example.com/home/1?ref=a#photos`, When `ListingUrl` is built, Then it normalizes to `https://example.com/home/1` (HR-F001-AC12).
- Given a property type outside the closed list, When built, Then it is rejected (HR-F002-AC11).
- Given a condition outside the closed list, When built, Then it is rejected (HR-F002-AC12).
- Given energy certificate `in process`, When modeled, Then it is a distinct value, not a letter (HR-F002-AC13).

**Out of scope.** Aggregates and ORM mappings.

**References.** `architecture/conventions.md` (shared-kernel), D17, D18.

#### S-M0-12 · [M0] Docker Compose: PostgreSQL with PostGIS and Redis

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-01

**Goal.** One command brings up the local data services.

**Scope.** `compose.yaml` (Postgres + PostGIS with healthcheck and volume, Redis), `.env.example`, root scripts `infra:up`/`infra:down`, short dev setup note.

**Acceptance criteria**

- Given Docker, When `pnpm infra:up` runs, Then Postgres (with PostGIS extension available) and Redis become healthy.
- Given `infra:down`, When run, Then containers stop and data volumes persist.

**Out of scope.** Observability services (S-M0-25); production compose (S-M4-15).

**References.** `operations/overview.md`, D6, D8.

#### S-M0-13 · [M0] Testcontainers helpers for integration specs

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-04, S-M0-12

**Goal.** Shared helpers to start Postgres+PostGIS and Redis per integration suite.

**Needs definition before starting:** whether helpers live in a new `packages/testing` or inside each app (conventions list only two packages).

**Scope.** `packages/testing` (private) or equivalent: `startPostgres()`, `startRedis()`, schema reset helper, global setup/teardown; sample integration spec.

**Acceptance criteria**

- Given an integration spec, When it runs, Then it gets a throwaway PostGIS database with `postgis` enabled.
- Given two suites, When run in parallel, Then they do not share state.
- Given Docker is unavailable, When the suite starts, Then it fails with an explicit message.

**Out of scope.** Context-specific fixtures.

**References.** `architecture/conventions.md` (Testing), D14.

#### S-M0-14 · [M0] apps/api: NestJS skeleton with CQRS, config and OpenAPI

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `P0`
- Depends on: S-M0-09

**Goal.** A bootable API following the screaming-architecture layout.

**Scope.** `apps/api` NestJS app; `src/core` (config with validated env schema, exception-mapping registry, base filters), `src/contexts/` empty; `@nestjs/cqrs`; `@nestjs/swagger` OpenAPI document served and emitted to a file; `/api` prefix; e2e spec booting the app.

**Acceptance criteria**

- Given the app starts, When `GET /api/openapi.json` is requested, Then a valid OpenAPI document is returned.
- Given an invalid env value, When the app starts, Then it fails fast naming the variable.
- Given a context exception registered with its mapping, When thrown, Then the response uses its status and code.

**Out of scope.** ORM (S-M0-15), health (S-M0-16).

**References.** `architecture/conventions.md` (Backend), D4, D22, D25.

#### S-M0-15 · [M0] apps/api: MikroORM and per-context schema migrations

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `ctx:listings` `P0`
- Depends on: S-M0-13, S-M0-14

**Goal.** Persistence wiring with one PostgreSQL schema per bounded context.

**Scope.** MikroORM module with per-context entity discovery; migration tooling producing migrations per schema (`ingestion`, `listings`, `properties`, `geography`, `identity`, `users`); PostGIS extension migration; naming rules; integration spec applying all migrations on Testcontainers.

**Acceptance criteria**

- Given an empty database, When migrations run, Then each context schema exists and `postgis` is enabled.
- Given a context, When its migration is generated, Then it only touches its own schema.
- Given the migration run twice, When repeated, Then it is idempotent.

**Out of scope.** Context tables (created by each context's first slice); outbox tables (S-M0-17).

**References.** `architecture/database-schema.md` (Layout rules), D6, D30.

#### S-M0-16 · [M0] apps/api: health checks with terminus

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `P0`
- Depends on: S-M0-15

**Goal.** Health endpoint reporting PostgreSQL and Redis state (public, no auth).

**Scope.** `@nestjs/terminus` `/api/health` with Postgres and Redis indicators; e2e specs with Testcontainers; OpenAPI entry.

**Acceptance criteria**

- Given all dependencies reachable, When the health check is called, Then it reports healthy (HR-F012-AC4).
- Given PostgreSQL unreachable, When called, Then it reports unhealthy (HR-F012-AC3).
- Given Redis unreachable, When called, Then it reports unhealthy.

**Out of scope.** Ingestion health (S-M0-22).

**References.** `features/hr-f012-admin-observability.md`, D15.

#### S-M0-17 · [M0] Outbox table, transaction manager and outbox-aware write repository base

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `P0`
- Depends on: S-M0-15

**Goal.** Aggregate changes and their events are saved in the same transaction (D31).

**Scope.** `outbox_event` migrations for `ingestion`, `listings`, `properties`, `identity` per `database-schema.md`; transaction manager port and MikroORM adapter; base write repository that inserts `peekDomainEvents()` into the outbox, commits, then `clearDomainEvents()` and `markPersisted(version)`; optimistic-lock conflict exception.

**Acceptance criteria**

- Given an aggregate with two events, When saved, Then both rows exist in `outbox_event` with the aggregate version.
- Given a failure after the insert, When the transaction rolls back, Then no outbox rows remain and events are not cleared.
- Given a stale version, When saved, Then an optimistic-lock exception is raised.

**Out of scope.** The relay that publishes rows (S-M0-18).

**References.** `architecture/database-schema.md` (Outbox), D23, D31.

#### S-M0-18 · [M0] Outbox relay and processed_event idempotent consumers

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `P0`
- Depends on: S-M0-17

**Goal.** Events leave the outbox reliably and consumers are idempotent.

**Scope.** Relay that polls unpublished `outbox_event` rows with `FOR UPDATE SKIP LOCKED`, dispatches to in-process handlers, marks published; `processed_event` table and an idempotent-consumer helper `(event_id, consumer)`; aggregate-version ordering guard.

**Acceptance criteria**

- Given an unpublished row, When the relay runs, Then handlers receive the event once and the row is marked published.
- Given a handler failure, When the relay retries, Then the event is delivered again.
- Given an event already in `processed_event` for a consumer, When redelivered, Then the consumer skips it.
- Given two relay instances, When running concurrently, Then no event is dispatched twice concurrently.

**Out of scope.** Real consumers (arrive with `properties`, `users`).

**References.** `architecture/database-schema.md` (Outbox, Processed events), D31.

#### S-M0-19 · [M0] apps/web: Vite skeleton with TanStack Router and Query

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:web` `P0`
- Depends on: S-M0-01

**Goal.** A bootable React app with typed routing and server-state plumbing.

**Scope.** `apps/web` Vite + React + TS strict; TanStack Router (file or code routes, typed search params helper); TanStack Query provider and query-key factory; Zustand store scaffold; Vitest + Testing Library setup; root route and 404.

**Acceptance criteria**

- Given the app builds, When `pnpm --filter web build` runs, Then it succeeds.
- Given an unknown path, When opened, Then the not-found route renders.
- Given a route with typed search params, When invalid params are used, Then they are rejected by validation.

**Out of scope.** i18n, composition root (S-M0-20).

**References.** `architecture/conventions.md` (Frontend), D5, D26.

#### S-M0-20 · [M0] apps/web: react-i18next adapter and composition root

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:web` `P0`
- Depends on: S-M0-19

**Goal.** Frontend ports, adapters and Spanish-first translation set up once.

**Scope.** i18n port with react-i18next adapter and typed keys, `es` catalog (default) with `en` stub; composition root wiring ports to adapters and a test override mechanism (no `vi.mock`); formatters for EUR and areas in Spanish locale.

**Acceptance criteria**

- Given a missing translation key, When typechecked, Then it fails (typed keys).
- Given the Spanish locale, When 200000 EUR is formatted, Then it shows the Spanish format.
- Given a test, When it swaps an adapter in the composition root, Then components use the fake.

**Out of scope.** Feature screens.

**References.** `architecture/conventions.md` (Composition root, Internationalization), D12, D27.

#### S-M0-21 · [M0] apps/web: MSW, Storybook and atomic design folders

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:web` `P0`
- Depends on: S-M0-20

**Goal.** Tooling to build components in isolation with mocked APIs.

**Scope.** MSW (node for Vitest, browser for Storybook); Storybook with MSW addon; atomic design folders (`atoms`, `molecules`, `organisms`, `templates`, container/presentational rule) with one sample atom, story and spec; ESLint boundaries for frontend layers.

**Acceptance criteria**

- Given a component spec, When it calls an API, Then MSW answers and unhandled requests fail the test.
- Given Storybook, When started, Then the sample story renders.
- Given a presentational component importing a container, When linted, Then it fails.

**Out of scope.** Real screens.

**References.** `architecture/conventions.md` (Components), D5, D14.

#### S-M0-22 · [M0] apps/web: typed OpenAPI client and up-to-date check in CI

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:web` `app:api` `P0`
- Depends on: S-M0-14, S-M0-21

**Goal.** The frontend consumes a generated typed client; drift fails CI.

**Scope.** `openapi-typescript` generation from the API document into `apps/web`; HTTP client port + adapter using the generated types; script `api:generate`; CI step that regenerates and fails on diff.

**Acceptance criteria**

- Given a changed API DTO, When the client is not regenerated, Then CI fails.
- Given the generated types, When an endpoint is called through the port, Then request and response are typed.
- Given the port, When swapped in the composition root, Then components are unaffected.

**Out of scope.** Feature endpoints.

**References.** D22, D16, `architecture/conventions.md` (Transport).

#### S-M0-23 · [M0] apps/ingestion: NestJS skeleton with BullMQ

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:ingestion` `P0`
- Depends on: S-M0-12, S-M0-14

**Goal.** A worker app with queue plumbing and health, no connectors yet.

**Scope.** `apps/ingestion` NestJS standalone worker; BullMQ module (Redis connection, queue registry, repeatable job helper); shared config pattern; terminus health; integration spec enqueuing and consuming a no-op job on Testcontainers.

**Acceptance criteria**

- Given Redis, When a no-op job is enqueued, Then the worker consumes it once.
- Given Redis unreachable, When health is called, Then it reports unhealthy.
- Given two worker replicas, When one job is enqueued, Then only one processes it.

**Out of scope.** Connectors, runs, scheduling (M5).

**References.** D4, D7, D23, `architecture/ingestion-concurrency.mdx`.

#### S-M0-24 · [M0] Observability in code: pino logging and OpenTelemetry adapter

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `app:api` `app:ingestion` `P0`
- Depends on: S-M0-16, S-M0-23

**Goal.** Structured logs correlated with traces behind replaceable adapters.

**Scope.** Pino logger (JSON, trace id, redaction of `password`/`token`/authorization fields) and OTel SDK initialization (traces, metrics) behind ports/adapters in api and ingestion; request logging interceptor; env-driven OTLP endpoint.

**Acceptance criteria**

- Given an API request, When processed, Then a structured log line with a trace identifier is written (HR-F012-AC1).
- Given a log call containing a `password` field, When written, Then the value is redacted (HR-F012-BR11).
- Given the OTel adapter replaced in tests, When the app runs, Then application code is unchanged (HR-F012-BR12).

**Out of scope.** Collector and backends (S-M0-25); alerts (S-M5).

**References.** `features/hr-f012-admin-observability.md`, D10, D15.

#### S-M0-25 · [M0] Observability stack in Compose: Collector, Prometheus, Loki, Tempo, Grafana

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-12, S-M0-24

**Goal.** Local stack that receives telemetry from the apps.

**Scope.** Compose services and config files: OpenTelemetry Collector (OTLP in, to Prometheus/Loki/Tempo), Prometheus, Loki, Tempo, Grafana with provisioned datasources and one placeholder dashboard; optional compose profile.

**Acceptance criteria**

- Given the stack is up, When the API handles a request, Then its trace is visible in Tempo and its log in Loki.
- Given Grafana, When opened, Then the three datasources are provisioned and healthy.
- Given the profile off, When `infra:up` runs, Then only Postgres and Redis start.

**Out of scope.** Dashboards and alert rules (M5).

**References.** `operations/overview.md`, D15.

#### S-M0-26 · [M0] Docker images tagged with product version and commit SHA

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-06, S-M0-14, S-M0-19, S-M0-23

**Goal.** Deployable images for api, web and ingestion, traceable to a release (R5).

**Needs definition before starting:** container registry (GHCR assumed, not stated in the sources).

**Scope.** Multi-stage Dockerfiles for `apps/api`, `apps/web`, `apps/ingestion`; `.dockerignore`; GitHub workflow building images on `main` (tag `sha-<commit>`) and on release tags (`<version>` and `<version>` + `sha`); registry choice documented.

**Acceptance criteria**

- Given a push to `main`, When the workflow runs, Then each image is built and tagged with the commit SHA.
- Given release tag `v0.3.0`, When the workflow runs, Then images are tagged `0.3.0` and with the commit SHA.
- Given a built image, When started with minimal env, Then the process boots.

**Out of scope.** Server deployment (S-M4-15).

**References.** `odd/tasks/roadmap.md` R5, D8.

#### S-M0-27 · [M0] Renovate for dependency updates

- Milestone: M0 · Foundation
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P1`
- Depends on: S-M0-05

**Goal.** Dependency updates arrive as small, reviewable PRs that CI checks, instead of manual bumps.

**Scope.** `renovate.json` at the root extending `config:recommended`; `rangeStrategy: pin`, so new versions stay exact-pinned like today; Conventional Commit messages (`chore(deps): ...`) that pass commitlint; groups for packages released together (for example `typescript-eslint`, `@commitlint/*`, Astro and Starlight); updates for `packageManager`, `engines` and GitHub Actions; a weekly schedule, a dependency dashboard issue and lockfile maintenance. A workspace test validates the config with `renovate-config-validator`. The maintainer installs the Renovate GitHub App. The conventions Tooling section documents the policy in EN and ES.

**Acceptance criteria**

- Given an outdated devDependency, When Renovate runs, Then it opens a PR that bumps the exact pin and updates `pnpm-lock.yaml`.
- Given a Renovate PR, When CI runs, Then its commit message passes commitlint and the usual checks run.
- Given packages from one group, When several update together, Then Renovate opens one grouped PR.
- Given an invalid `renovate.json`, When the workspace tests run, Then they fail.

**Out of scope.** Automerge (decide once CI has run on Renovate PRs for a while); security alert triage beyond what Renovate opens.

**References.** `architecture/conventions.md` (Tooling), D16.

### M1 · Walking skeleton

#### S-M1-01 · [M1] Listing aggregate with the normalized model

- Milestone: M1 · Walking skeleton
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M0-11

**Goal.** The `Listing` aggregate holds the normalized, source-independent listing with unknown-aware fields.

**Scope.** `apps/api/src/contexts/listings/domain/`: `Listing` aggregate, value objects (title, description, price, built/usable/plot area, bedrooms, bathrooms, year, additional features), builder, `ListingImported` event, exceptions, primitives. Identity = source + external id; manual listing gets an internal UUID.

**Acceptance criteria**

- Given any source, When a payload is normalized, Then the listing has the same field set (HR-F002-AC1).
- Given a missing year, When built, Then it is Unknown (HR-F002-AC2).
- Given a new listing, When created, Then source, original URL, date added and last check are recorded (HR-F002-AC10, HR-F001-BR12).
- Given a manual listing without external id, When saved, Then it gets an internal UUID identity (HR-F001-AC11).

**Out of scope.** Persistence (S-M1-03); location pin (M2).

**References.** `features/hr-f002-normalization.md`, `domain/aggregates.md` (Listing), D20, D29.

#### S-M1-02 · [M1] Observation aggregate (append-only)

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M1-01

**Goal.** Immutable observations recording price and active state per listing.

**Scope.** `Observation` aggregate (listing id, run id optional, observed at, price, active flag, snapshot), `ListingObserved` event, uniqueness rule per (listing, run); no update path.

**Acceptance criteria**

- Given a new listing, When created, Then a first observation with price and date exists (HR-F008-AC1).
- Given a stored observation, When a later one differs, Then the earlier one is not modified (HR-F008-AC11).
- Given an attempt to modify an observation, When executed, Then it is impossible (HR-F008-BR11).

**Out of scope.** Price-change rules and history (M3).

**References.** `domain/aggregates.md` (Observation), `features/hr-f008-price-history.md`, D20.

#### S-M1-03 · [M1] Listings persistence: schema, ORM and repositories with upsert

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M1-02, S-M0-17

**Goal.** Listings and observations stored in the `listings` schema with idempotent identity.

**Scope.** Migration for `listings.listing` and `listings.observation` per schema doc; MikroORM entities and mappers; write repository on the outbox base (unique `(source, external_id)` upsert, optimistic version); minimal read repository; integration specs on Testcontainers.

**Acceptance criteria**

- Given a source and external id that exist, When ingested again, Then the listing is updated and none is created (HR-F001-AC3).
- Given a saved listing, When read back, Then it equals the original aggregate.
- Given a save, When committed, Then `ListingObserved` is in the outbox.

**Out of scope.** Use cases and endpoints.

**References.** `architecture/database-schema.md` (listings), D6, D23, D30.

#### S-M1-04 · [M1] ingestion context: manual Source and ImportManualListing command

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `ctx:listings` `app:api` `P0`
- Depends on: S-M1-03

**Goal.** The manual import use case with URL normalization and required-field validation.

**Scope.** `ingestion` context: `Source` aggregate (kind `manual`, seeded enabled), `ImportManualListing` command handler creating `Listing` + first `Observation` via a port; URL stored as provenance and never fetched; duplicate normalized URL returns a warning result.

**Acceptance criteria**

- Given a URL and required fields, When imported, Then a listing is created and no request is made to the URL (HR-F001-AC1).
- Given a missing required field, When submitted, Then nothing is created and missing fields are reported (HR-F001-AC2).
- Given an existing manual listing for the normalized URL, When imported again, Then the user is warned, offered check listing and no listing is created (HR-F001-AC12).

**Out of scope.** REST endpoint (S-M1-05); pin (M2).

**References.** `features/hr-f001-ingestion.md`, `domain/aggregates.md` (Source), D17, D20.

#### S-M1-05 · [M1] API: POST manual listing endpoint

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:api` `P0`
- Depends on: S-M1-04, S-M0-14

**Goal.** HTTP entry point for the assisted manual import.

**Scope.** Controller + DTOs + class-validator, mapping of domain exceptions to 400/409, OpenAPI documentation, e2e spec.

**Acceptance criteria**

- Given a valid body, When posted, Then 201 with the listing/property reference is returned.
- Given missing fields, When posted, Then 400 lists the missing fields (HR-F001-AC2).
- Given a duplicate normalized URL, When posted, Then 409 with the existing listing reference (HR-F001-AC12).

**Out of scope.** Web form (S-M1-11).

**References.** `features/hr-f001-ingestion.md`, D22.

#### S-M1-06 · [M1] properties: Property aggregate created 1:1 from ListingObserved

- Milestone: M1 · Walking skeleton
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M0-18, S-M1-03

**Goal.** Each new listing becomes its own property (no duplicate linking yet).

**Scope.** `properties` context: `Property` aggregate (references listing ids), consumer of `ListingObserved` using `processed_event`; `PropertyCreated` event.

**Acceptance criteria**

- Given a new listing observed, When the event is consumed, Then one property references it.
- Given the same event delivered twice, When consumed, Then one property exists.
- Given an out-of-order older event, When consumed, Then it is ignored by the version guard.

**Out of scope.** Projection and persistence (S-M1-07, S-M1-08).

**References.** `domain/aggregates.md` (Property), D28, D29, D31.

#### S-M1-07 · [M1] properties: persistence and processed_event for the context

- Milestone: M1 · Walking skeleton
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M1-06

**Goal.** Schema and repositories for the `properties` context.

**Scope.** Migrations (`property`, `processed_event`, `outbox_event` if absent), entities, write/read repositories, wiring of the consumer to the relay; integration spec relay → consumer → table.

**Acceptance criteria**

- Given an unpublished `ListingObserved`, When the relay runs, Then the property row exists.
- Given a processed event, When replayed, Then no second row is created.

**Out of scope.** Projections.

**References.** `architecture/database-schema.md` (properties, Processed events), D30, D31.

#### S-M1-08 · [M1] properties: property_search_view with representative price and consolidation

- Milestone: M1 · Walking skeleton
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M1-07

**Goal.** Read model with consolidated attributes, conflicts and representative price (D19, D20).

**Scope.** `property_search_view` projection updated from listing events: most recent observed value per attribute, conflict flag with each value and source, representative price = lowest active price, price per m2 from built area only, rebuildable.

**Acceptance criteria**

- Given two active listings at 200 000 and 190 000, When read, Then the representative price is 190 000 (HR-F002-AC8).
- Given built areas 100 and 105 in two listings, When read, Then the latest value is shown and the conflict listed with sources (HR-F002-AC7).
- Given a listing with only usable area, When read, Then price per m2 is Unknown (HR-F002-AC4).
- Given a listing that disappears, When projected, Then it no longer counts toward the price and observations remain (HR-F002-AC9).

**Out of scope.** Search filters (M2); history series (M3).

**References.** `features/hr-f002-normalization.md`, `domain/aggregates.md` (Projections), D19, D20.

#### S-M1-09 · [M1] API: GET properties (basic list) and GET property detail

- Milestone: M1 · Walking skeleton
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M1-08, S-M0-22

**Goal.** Read endpoints feeding the first screens.

**Scope.** Query handlers and controllers: `GET /properties` (page size 24, default hides properties without active listing, sort by date added) returning `N listings, from X` data; `GET /properties/:id` with listings tab data, conflicts, calculated flags; 404 for unknown id; OpenAPI.

**Acceptance criteria**

- Given one property with two active listings, When listed, Then it appears once with 2 listings from 190 000 (HR-F003-AC1).
- Given an unknown id, When requested, Then 404 is returned (HR-F004-AC10).
- Given more than 24 properties, When listed, Then the first page has 24 (HR-F003-BR15).

**Out of scope.** Filters (M2).

**References.** `features/hr-f004-property-detail.md`, `features/hr-f003-search.md`, D19, D22.

#### S-M1-10 · [M1] web: shared fields, formatters and API adapters for properties

- Milestone: M1 · Walking skeleton
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M1-09, S-M0-22

**Goal.** Frontend domain model, ports and use cases for properties and manual import.

**Scope.** `apps/web` property and listing domain types, query-key factory, use cases (always present), HTTP adapters, MSW handlers; unknown-value display component (unknown never blank or 0).

**Acceptance criteria**

- Given an unknown value, When rendered, Then it reads as unknown (HR-F004-AC9).
- Given a calculated value, When rendered, Then it is marked calculated (HR-F004-BR5).
- Given the use cases with a fake port, When run, Then no HTTP is needed.

**Out of scope.** Screens.

**References.** `features/hr-f004-property-detail.md`, `architecture/conventions.md` (Frontend).

#### S-M1-11 · [M1] web: manual import assisted form

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M1-05, S-M1-10

**Goal.** The user registers a listing by URL and form without any scraping.

**Scope.** Import route, container + presentational form (URL, price, type, areas, bedrooms, etc.), field validation messages in Spanish, duplicate-URL warning with link to check listing; location left unknown until the pin picker (M2).

**Acceptance criteria**

- Given required fields filled, When submitted, Then the listing is created and the user lands on its property (HR-F001-AC1).
- Given a missing field, When submitted, Then the form shows which fields are missing (HR-F001-AC2).
- Given a duplicate normalized URL, When submitted, Then the warning appears and no listing is created (HR-F001-AC12).

**Out of scope.** Pin picker, photos (post-MVP, HR-F001-BR18).

**References.** `features/hr-f001-ingestion.md`, D12, D17.

#### S-M1-12 · [M1] web: property detail page

- Milestone: M1 · Walking skeleton
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M1-10

**Goal.** The detail page with listings, conflicts and unknown handling.

**Scope.** Detail route, sections: title/description from the latest listing, representative price with listing count, features, built/plot area, price per m2, listings tab (source, price, status, date, original link), conflict display, no gallery when no allowed images, not-found screen.

**Acceptance criteria**

- Given two listings from different sources, When opened, Then both appear with source, price, status and original link (HR-F004-AC1).
- Given listings disagreeing on bedrooms 3 and 4, When opened, Then latest value, conflict flag and both values with sources show (HR-F004-AC2).
- Given no built area, When opened, Then price per m2 is unknown (HR-F004-AC3).
- Given no allowed images, When opened, Then no gallery and the original link is present (HR-F004-AC5).
- Given differing titles, When opened, Then the latest listing title shows and others are in the listings tab (HR-F004-AC13).

**Out of scope.** History chart, duplicates, actions, location (later milestones).

**References.** `features/hr-f004-property-detail.md`, D19, D20.

#### S-M1-13 · [M1] web: basic property list page

- Milestone: M1 · Walking skeleton
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M1-10

**Goal.** A first list of properties to reach the detail page.

**Scope.** List route (24 per page, simple pagination), property card with `N listings, from X`, link to detail, empty state; no filters yet.

**Acceptance criteria**

- Given a property with two active listings, When listed, Then it shows once as `2 listings, from 190 000 EUR` (HR-F003-AC1).
- Given no properties, When opened, Then an empty state is shown.
- Given a property without active listing, When listed by default, Then it is hidden (HR-F003-AC4).

**Out of scope.** Filters, sort, URL state (M2).

**References.** `features/hr-f003-search.md`, D19.

#### S-M1-14 · [M1] Walking skeleton end-to-end test (Playwright)

- Milestone: M1 · Walking skeleton
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `type:foundation` `app:web` `app:api` `P0`
- Depends on: S-M1-11, S-M1-12, S-M1-13

**Goal.** A browser test crossing form, API, outbox relay, projection and list/detail.

**Needs definition before starting:** whether the browser e2e job is a required CI check (sources say critical flows only).

**Scope.** Playwright setup (`apps/web` or root e2e folder), compose-backed run, spec: import listing, see it in list, open detail; CI job for it.

**Acceptance criteria**

- Given a clean database, When the user imports a listing through the form, Then it appears in the list and its detail page shows the data.
- Given the same URL imported again, When submitted, Then the warning appears.
- Given CI, When the e2e job runs, Then it is a separate non-blocking-by-default job documented.

**Out of scope.** Further flows (added by later slices).

**References.** `architecture/conventions.md` (Testing), D14.

### M2 · Search & map

#### S-M2-01 · [M2] geography: schema and IGN boundary import script

- Milestone: M2 · Search & map
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:geography` `app:api` `P0`
- Depends on: S-M0-15

**Goal.** Read-only reference boundaries (Galicia) loaded from IGN.

**Needs definition before starting:** exact IGN dataset, version and license/attribution text to ship with the data.

**Scope.** `geography` schema migrations (autonomous community, province, municipality with PostGIS geometry and GIST index) per schema doc; import script reading the IGN dataset, idempotent; integration spec with a small fixture.

**Acceptance criteria**

- Given the fixture, When the import runs, Then municipalities, provinces and the community exist with valid geometries.
- Given the import run twice, When repeated, Then no duplicates exist.
- Given the context, When inspected, Then it has no aggregates and emits no events.

**Out of scope.** Derivation logic (S-M2-02).

**References.** `architecture/database-schema.md` (geography), `domain/aggregates.md`, D6, D28.

#### S-M2-02 · [M2] geography: point-in-polygon derivation of municipality and province

- Milestone: M2 · Search & map
- Parent: HR-F002 · Listing normalization
- Labels: `type:feature` `ctx:geography` `app:api` `P0`
- Depends on: S-M2-01

**Goal.** A port that derives municipality and province from a pin.

**Scope.** `DeriveAdministrativeArea` query/port (PostGIS `ST_Contains`), adapter, consumption from `listings`/`properties` when a pin is set (via event or application service), unknown when outside every boundary.

**Acceptance criteria**

- Given a pin inside a municipality, When saved, Then municipality and province are derived and stored with the pin and precision (HR-F002-AC5).
- Given a pin outside all boundaries, When saved, Then they stay unknown and the pin is kept (HR-F002-AC6).
- Given boundary edge cases, When tested, Then results are deterministic.

**Out of scope.** Pin editing endpoint (S-M2-03).

**References.** `features/hr-f002-normalization.md` (BR7), D18.

#### S-M2-03 · [M2] API: set listing pin with declared precision

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `ctx:listings` `app:api` `P1`
- Depends on: S-M2-02, S-M1-05

**Goal.** Commands and endpoint to place or move a pin with mandatory precision.

**Scope.** `SetListingLocation` command in `listings` (GeoPoint + precision required), derived area stored, event `ListingDetailsCorrected` or equivalent, DTO and OpenAPI, import endpoint accepts optional pin.

**Acceptance criteria**

- Given a pin and precision, When saved, Then both are stored and municipality and province are derived (HR-F006-AC9).
- Given a pin without precision, When submitted, Then it is rejected (HR-F006-AC10).
- Given a changed pin, When saved, Then the projection updates.

**Out of scope.** Picker UI (S-M2-05).

**References.** `features/hr-f006-map.md`, D18.

#### S-M2-04 · [M2] web: map port, MapLibre adapter and OpenFreeMap tiles

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M0-21

**Goal.** A replaceable map abstraction with attribution.

**Scope.** Map port (render markers, bounds, events, fit), MapLibre GL adapter, tiles adapter for OpenFreeMap, always-visible OSM attribution, fake adapter for tests/stories, contract spec both adapters pass.

**Acceptance criteria**

- Given the map, When displayed, Then OSM attribution is visible (HR-F006-AC14).
- Given the map adapter replaced by another port implementation, When used, Then behavior is unchanged (HR-F006-AC11).
- Given tiles unavailable, When the map loads, Then the UI degrades with a message.

**Out of scope.** Markers and clusters (S-M2-14).

**References.** `features/hr-f006-map.md`, D9, D10.

#### S-M2-05 · [M2] web: pin picker in the manual import form

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M2-03, S-M2-04, S-M1-11

**Goal.** Place or move a pin and choose its precision.

**Scope.** Pin picker organism using the map port, precision selector (exact, approximate, municipality), form integration and validation message.

**Acceptance criteria**

- Given the import form, When a pin and precision are chosen, Then they are sent and saved (HR-F006-AC9).
- Given no precision chosen, When submitting, Then the form asks for it (HR-F006-AC10).
- Given a saved property, When opened, Then the detail shows the location with precision (HR-F004-AC4).

**Out of scope.** Map results (S-M2-14).

**References.** `features/hr-f006-map.md`, D18.

#### S-M2-06 · [M2] API search: economic filters, visibility toggle and sort

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M1-09

**Goal.** Price and price-per-m2 filters, hidden-by-default rule and sorting.

**Scope.** Criteria/filter registry for min/max price (representative) and min/max price per m2 (built area only); `includeInactive` toggle; sort options (price asc/desc, price per m2, built area, plot area, date added, update date) with unknown last.

**Acceptance criteria**

- Given prices 150k, 200k, 250k, When min 200k and max 250k, Then only the last two return (HR-F003-AC2).
- Given usable area only, When filtering by price per m2, Then the property is not returned (HR-F003-AC3).
- Given sort by price ascending with unknowns, When listed, Then unknowns come last (HR-F003-AC9).
- Given toggle off/on, When searching, Then a property without active listing is hidden/shown (HR-F003-AC17).

**Out of scope.** Other filters.

**References.** `features/hr-f003-search.md`, D19, D20.

#### S-M2-07 · [M2] API search: area and feature filters

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M2-06

**Goal.** Area ranges and feature filters with unknown-never-matches semantics.

**Scope.** Filters: built/usable/plot area ranges, property type, bedrooms, bathrooms, condition, to renovate, detached, houses with land (plot known and > 0), garage, garden; AND combination.

**Acceptance criteria**

- Given unknown garage, When filtering with garage, Then the property is not returned (HR-F003-AC5).
- Given plot area 0 and another unknown, When `houses with land` is active, Then neither matches (HR-F003-AC14).
- Given several filters, When searching, Then only properties satisfying all are returned (HR-F003-AC6).

**Out of scope.** Geographic filters.

**References.** `features/hr-f003-search.md`, D20.

#### S-M2-08 · [M2] API search: administrative area filters

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `ctx:properties` `ctx:geography` `app:api` `P0`
- Depends on: S-M2-02, S-M2-07

**Goal.** Filter by autonomous community, province, municipality and postal code.

**Needs definition before starting:** source of the postal code for a property (not stated in the data model).

**Scope.** Filter fields on the view using derived values from pins; options endpoint listing available areas; postal code filter.

**Acceptance criteria**

- Given properties in two municipalities, When filtering by one, Then only its properties return.
- Given a property without pin, When filtering by municipality, Then it does not match.

**Out of scope.** Radius and polygon.

**References.** `features/hr-f003-search.md` (BR7), D18.

#### S-M2-09 · [M2] API search: radius and polygon spatial filters

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M2-07

**Goal.** PostGIS spatial queries on the pin.

**Scope.** `near(lat,lng,radiusKm)` and `polygon` filters via `ST_DWithin`/`ST_Contains`, GIST index, integration specs.

**Acceptance criteria**

- Given a location and 10 km, When applied, Then only properties within 10 km return and those without pin do not (HR-F003-AC7).
- Given a drawn polygon, When applied, Then only pins inside return (HR-F003-AC8).

**Out of scope.** UI.

**References.** `features/hr-f003-search.md`, D6.

#### S-M2-10 · [M2] API search: count, stable pagination and OpenAPI query contract

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M2-09

**Goal.** Result count and non-repeating pagination across all filters.

**Scope.** Total count, deterministic tie-breaker for paging, page param contract with 24 per page, regenerated client.

**Acceptance criteria**

- Given more results than a page, When paging, Then no result repeats or is skipped (HR-F003-AC12).
- Given more than 24 matches, When page 1 is requested, Then 24 return (HR-F003-AC15).
- Given no matches, When searching, Then count is 0 (HR-F003-AC13).

**Out of scope.** UI.

**References.** `features/hr-f003-search.md`, D22.

#### S-M2-11 · [M2] web: typed URL search state

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M2-10, S-M1-13

**Goal.** Filters, sort and page live in the URL and survive navigation.

**Scope.** TanStack Router validated search schema for all filters, sort and page; serialization helpers; back-navigation preserves state.

**Acceptance criteria**

- Given a URL with filters and page, When opened, Then the same filters and page apply (HR-F003-AC16).
- Given active filters, When opening a property and returning, Then they are intact (HR-F003-AC10).
- Given an invalid param, When opened, Then it is ignored with defaults.

**Out of scope.** Filter widgets.

**References.** `features/hr-f003-search.md`, D26.

#### S-M2-12 · [M2] web: economic, area and feature filter panel

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M2-11

**Goal.** Panel with price, area and feature filters.

**Scope.** Filter organism (inputs, selects, toggles), Spanish labels, formatted values, Storybook stories.

**Acceptance criteria**

- Given min and max price entered, When applied, Then results update and the URL reflects it (HR-F003-AC2).
- Given the toggle to include properties without active listing, When on, Then they appear (HR-F003-AC17).

**Out of scope.** Geographic UI.

**References.** `features/hr-f003-search.md`, D12.

#### S-M2-13 · [M2] web: geographic filters, sort, count, clear and empty state

- Milestone: M2 · Search & map
- Parent: HR-F003 · Search and filters
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M2-12

**Goal.** Admin-area, radius filters plus sorting and result chrome.

**Scope.** Area selectors, radius control, sort selector, result count, `clear filters` action, zero-results state offering to clear, pagination controls.

**Acceptance criteria**

- Given active filters, When `clear` is used, Then none apply and the count updates (HR-F003-AC11).
- Given no matches, When shown, Then count is 0 and clearing is offered (HR-F003-AC13).
- Given a radius of 10 km, When applied, Then results update (HR-F003-AC7).

**Out of scope.** Map.

**References.** `features/hr-f003-search.md`, D12.

#### S-M2-14 · [M2] web: map results with markers and clusters

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M2-04, S-M2-13

**Goal.** Map view of the current result set.

**Scope.** Map tab/route using the same query as the list, one marker per property with price, clustering with counts and zoom-in expansion.

**Acceptance criteria**

- Given results with pins, When the map opens, Then each property is one marker with price (HR-F006-AC1).
- Given a property with two active listings, When shown, Then it has one marker (HR-F006-AC2).
- Given many nearby properties, When zoomed out, Then clusters show counts and separate when zooming in (HR-F006-AC7).

**Out of scope.** Sync and area selection.

**References.** `features/hr-f006-map.md`, D9, D19.

#### S-M2-15 · [M2] web: list-map synchronization and marker precision

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M2-14

**Goal.** Highlighting, navigation and honest representation of location precision.

**Scope.** Hover/selection sync, marker click opens detail, distinct style for `approximate`/`municipality`, notice of results without pin (count).

**Acceptance criteria**

- Given list and map, When a result is selected, Then its marker is highlighted and vice versa (HR-F006-AC4).
- Given a marker, When selected, Then the detail page opens (HR-F006-AC3).
- Given `approximate` precision, When shown, Then the marker differs and says approximate (HR-F006-AC5).
- Given results without pin, When shown, Then they are absent and counted (HR-F006-AC6).

**Out of scope.** Area selection.

**References.** `features/hr-f006-map.md`, D18.

#### S-M2-16 · [M2] web: search this area and polygon selection

- Milestone: M2 · Search & map
- Parent: HR-F006 · Map
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M2-15, S-M2-09

**Goal.** Explicit spatial restriction from the map.

**Scope.** Polygon drawing tool, `search this area` button for the visible bounds; panning/zooming never changes results; wires to polygon filter in the URL.

**Acceptance criteria**

- Given an area selected and confirmed, When searching, Then only pins inside return (HR-F006-AC8).
- Given panning or zooming, When done, Then the list does not change (HR-F006-AC12).
- Given `search this area`, When pressed, Then results restrict to the visible area (HR-F006-AC13).

**Out of scope.** Saved searches storing the area (M4).

**References.** `features/hr-f006-map.md`, D9.

### M3 · History & duplicates

#### S-M3-01 · [M3] API: check listing command

- Milestone: M3 · History & duplicates
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M1-05

**Goal.** Record a new observation for a manual listing.

**Scope.** `CheckListing` command (price, still active, check date) and endpoint; records an observation and updates last check; manual listings only.

**Acceptance criteria**

- Given an active manual listing, When checked with a new price, Then an observation with price, status and date is recorded and last check updated (HR-F001-AC8).
- Given an automatic-source listing, When checked manually, Then it is rejected.
- Given the same price, When checked, Then no price change is recorded but last check is updated (HR-F008-AC3).

**Out of scope.** Mark disappeared; UI.

**References.** `features/hr-f001-ingestion.md` (BR11), D17, D20.

#### S-M3-02 · [M3] API: mark manual listing as disappeared and recalculate price

- Milestone: M3 · History & duplicates
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `ctx:listings` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-01, S-M1-08

**Goal.** Manual disappearance as a history event.

**Scope.** `MarkListingDisappeared` command/endpoint, `ListingDisappeared` event consumed by `properties` projection (representative price recalculated), reappearance rule via check listing (`ListingReappeared`).

**Acceptance criteria**

- Given an active manual listing, When marked disappeared, Then status becomes `disappeared` and the representative price is recalculated (HR-F004-AC8).
- Given the only listing disappears, When projected, Then the property has no representative price.
- Given disappearance, When recorded, Then it is a history event (HR-F008-BR8).

**Out of scope.** UI.

**References.** `features/hr-f004-property-detail.md`, D20.

#### S-M3-03 · [M3] API: edit descriptive data of a manual listing with audit record

- Milestone: M3 · History & duplicates
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M3-01

**Goal.** In-place corrections without bypassing observations.

**Needs definition before starting:** audit record storage shape (not described in the schema doc).

**Scope.** `CorrectListingDetails` command/endpoint (price and status excluded), audit record table/entry, `ListingDetailsCorrected` event.

**Acceptance criteria**

- Given a manual listing, When a descriptive field is corrected, Then it updates in place and an audit record is kept (HR-F004-AC11).
- Given an attempt to change price or status directly, When submitted, Then it is rejected and check listing is required (HR-F004-AC12).

**Out of scope.** UI.

**References.** `features/hr-f004-property-detail.md` (BR12), D20.

#### S-M3-04 · [M3] web: check listing, mark disappeared and edit actions

- Milestone: M3 · History & duplicates
- Parent: HR-F004 · Property detail
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M3-02, S-M3-03, S-M1-12

**Goal.** Actions on the detail page for manual listings.

**Scope.** Check listing dialog, mark-as-disappeared confirm, edit form for descriptive fields; cache invalidation; hidden for non-manual listings.

**Acceptance criteria**

- Given an active manual listing, When the user selects mark as disappeared, Then its status updates and the price recalculates (HR-F004-AC8).
- Given the edit form, When price or status fields are sought, Then they are absent and check listing is offered (HR-F004-AC12).
- Given check listing with a new price, When submitted, Then the detail shows it (HR-F001-AC8).

**Out of scope.** History chart.

**References.** `features/hr-f004-property-detail.md`, `features/hr-f001-ingestion.md`.

#### S-M3-05 · [M3] Observation rules: price change, attribute change, immutability

- Milestone: M3 · History & duplicates
- Parent: HR-F008 · Price history
- Labels: `type:feature` `ctx:listings` `app:api` `P0`
- Depends on: S-M1-03

**Goal.** History rules built on observations.

**Scope.** Change detection against the previous observation (price, other relevant attributes), `ListingPriceChanged` event, snapshot storage, no deletion/compaction.

**Acceptance criteria**

- Given price 200 000 then 190 000, When observed, Then a price change is recorded and history has two points (HR-F008-AC2).
- Given an attribute change other than price, When stored, Then it is recorded in history (HR-F008-AC9).
- Given observations of any age, When read, Then all remain (HR-F008-AC12).

**Out of scope.** Series projection.

**References.** `features/hr-f008-price-history.md`, D20.

#### S-M3-06 · [M3] properties: price point projection (lowest active price evolution)

- Milestone: M3 · History & duplicates
- Parent: HR-F008 · Price history
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-05

**Goal.** Projection of the property's lowest active price over time.

**Scope.** `property_price_point` projection from listing events, rebuildable; migration and read repository.

**Acceptance criteria**

- Given two active listings 200 000 and 190 000, When the 190 000 listing disappears, Then the series shows the lowest active price rising to 200 000 (HR-F008-AC6).
- Given consolidated events replayed, When the projection is rebuilt, Then it is identical.

**Out of scope.** Endpoint.

**References.** `features/hr-f008-price-history.md`, `domain/aggregates.md`, D19.

#### S-M3-07 · [M3] API: price history endpoint with variations

- Milestone: M3 · History & duplicates
- Parent: HR-F008 · Price history
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-06

**Goal.** History series, first observation date and calculated variation.

**Scope.** `GET /properties/:id/price-history`: points, initial and current price, absolute and percentage variation, first observation date.

**Acceptance criteria**

- Given initial 200 000 and current 190 000, When requested, Then variation is -10 000 and -5 % (HR-F008-AC4).
- Given a single observation, When requested, Then initial equals current and variation is zero (HR-F008-AC5).
- Given first observed 2026-11-20, When requested, Then that date is returned (HR-F008-AC8).

**Out of scope.** Chart UI.

**References.** `features/hr-f008-price-history.md`, D22.

#### S-M3-08 · [M3] web: price history chart on the detail page

- Milestone: M3 · History & duplicates
- Parent: HR-F008 · Price history
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M3-07, S-M1-12

**Goal.** Chart with accessible alternative and coverage notice.

**Needs definition before starting:** chart library (not named in the sources read).

**Scope.** Chart component (library per D5 choices), textual alternative table, notice `covers data from <date>`, variation display.

**Acceptance criteria**

- Given a property with history, When opened, Then a chart shows the lowest active price evolution (HR-F008-AC10).
- Given the history, When shown, Then it states it covers data from the first observation (HR-F008-AC8, HR-F004-AC6).
- Given a screen reader, When reading, Then a textual alternative is available (HR-F008-BR10).

**Out of scope.** Dashboard charts (M6).

**References.** `features/hr-f008-price-history.md`, D12.

#### S-M3-09 · [M3] properties: DuplicateCandidate aggregate and states

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M1-07

**Goal.** Aggregate for candidate pairs with open, linked and dismissed states.

**Scope.** `DuplicateCandidate` aggregate, unique pair, state transitions, events, persistence and migration.

**Acceptance criteria**

- Given a pair, When detection runs again, Then no second candidate is created whether open, resolved or dismissed (HR-F005-BR8).
- Given a dismissed pair, When detection runs, Then it is not suggested (HR-F005-AC9).

**Out of scope.** Detection policy.

**References.** `features/hr-f005-duplicates.md`, `domain/aggregates.md`, D21.

#### S-M3-10 · [M3] properties: detection policy domain service

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-09

**Goal.** The candidate criteria as a pure domain service.

**Scope.** Policy: distance < 100 m for exact pins, same municipality when either precision is not exact, built area within 5 %, same bedrooms; unknowns never match; same source+external id excluded; configurable thresholds.

**Acceptance criteria**

- Given two listings 80 m apart, 100 and 104 m2, 3 bedrooms, When evaluated, Then they are a candidate (HR-F005-AC2).
- Given 120 m apart, When evaluated, Then not (HR-F005-AC3).
- Given areas 100 and 106, When evaluated, Then not (HR-F005-AC4).
- Given differing bedrooms or unknown built area, When evaluated, Then not (HR-F005-AC5, AC6).
- Given approximate pin, same municipality, When evaluated, Then candidate (HR-F005-AC12); different municipality, not (AC13).

**Out of scope.** Wiring.

**References.** `features/hr-f005-duplicates.md`, D21.

#### S-M3-11 · [M3] properties: non-blocking detection on events and configuration

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-10

**Goal.** Detection triggered by listing changes without blocking ingestion.

**Scope.** Consumers for `ListingObserved`/location/area/bedroom changes; env-configured thresholds (100 m, 5 %) validated at startup; idempotent persistence.

**Acceptance criteria**

- Given an ingestion of an existing identity, When detection runs, Then no candidate is created for it (HR-F005-AC1).
- Given a threshold set by env var, When the app starts, Then it is applied (HR-F005-AC16, AC10).
- Given a very strong match, When detected, Then nothing is linked (HR-F005-AC11).

**Out of scope.** Resolution.

**References.** `features/hr-f005-duplicates.md` (BR11, BR14), D21.

#### S-M3-12 · [M3] API: list candidates and link as same property

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-11

**Goal.** Resolve a candidate by merging properties.

**Scope.** Query for candidates (with compared fields incl. price and address data), `LinkAsSameProperty` command, `PropertiesMerged` event, survivor keeps the most precise location (changeable), projection rebuild.

**Acceptance criteria**

- Given a candidate, When resolved as same property, Then both listings belong to one property and search shows it once (HR-F005-AC7).
- Given properties with different precision, When linked, Then the survivor keeps the most precise location and it can be changed (HR-F005-AC15).

**Out of scope.** Dismiss, undo.

**References.** `features/hr-f005-duplicates.md`, D19, D20.

#### S-M3-13 · [M3] API: dismiss candidate and undo link

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `ctx:properties` `app:api` `P0`
- Depends on: S-M3-12

**Goal.** Remember dismissals and reverse links.

**Scope.** `DismissCandidate` command; `UndoLink` moving a listing to a new property with history intact; endpoints and OpenAPI.

**Acceptance criteria**

- Given a candidate, When dismissed, Then it no longer appears (HR-F005-AC8).
- Given two linked listings, When the link is undone, Then one moves to a new property and each listing's history is intact (HR-F005-AC14).

**Out of scope.** UI.

**References.** `features/hr-f005-duplicates.md` (BR6, BR12), D20.

#### S-M3-14 · [M3] web: duplicate candidates review and resolution

- Milestone: M3 · History & duplicates
- Parent: HR-F005 · Duplicate detection
- Labels: `type:feature` `app:web` `P0`
- Depends on: S-M3-13, S-M1-12

**Goal.** Candidates on the detail page and a comparison view.

**Scope.** Candidates list on detail (none linked automatically), comparison view with price and address fields, actions same/different, undo link control.

**Acceptance criteria**

- Given pending candidates, When the detail opens, Then they are listed for review and none is linked (HR-F004-AC7).
- Given a candidate, When `different property` is chosen, Then the pair is dismissed (HR-F005-AC8).
- Given a linked property, When undo is chosen, Then the listing moves to a new property (HR-F005-AC14).

**Out of scope.** Favorites on merge (M4).

**References.** `features/hr-f005-duplicates.md`, `features/hr-f004-property-detail.md`.

### M4 · Users

#### S-M4-01 · [M4] identity: Account aggregate, argon2 hashing and password policy

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:identity` `app:api` `P1`
- Depends on: S-M0-18

**Goal.** Accounts that support several users, with hashed passwords of at least 12 characters.

**Scope.** `identity` context: `Account` aggregate, password VO (min 12), hasher port with argon2 adapter, migration `identity.account`, `AccountCreated` event.

**Acceptance criteria**

- Given a stored account, When inspected, Then the password is an argon2 hash (HR-F010-AC6).
- Given a password shorter than 12, When set, Then it is rejected (HR-F010-AC14).
- Given the model, When two accounts are created, Then both persist (HR-F010-BR4).

**Out of scope.** Seed, sessions.

**References.** `features/hr-f010-users.md`, `domain/aggregates.md` (Account), D13.

#### S-M4-02 · [M4] identity: seed CLI and UserProfile creation

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:identity` `ctx:users` `app:api` `P1`
- Depends on: S-M4-01

**Goal.** The only way to create the first account.

**Scope.** CLI command reading credentials from env, failing if an account exists; `users` consumer of `AccountCreated` creating `UserProfile`.

**Acceptance criteria**

- Given credentials in env and no account, When the seed runs, Then the account is created (HR-F010-AC11, AC1).
- Given the seed already ran, When it runs again, Then it fails and nothing is overwritten (HR-F010-AC10).
- Given the account, When created, Then a profile exists.

**Out of scope.** Login.

**References.** `features/hr-f010-users.md` (BR12), D13.

#### S-M4-03 · [M4] identity: login with Redis sessions and log redaction

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:identity` `app:api` `P1`
- Depends on: S-M4-01, S-M0-24

**Goal.** Sign-in via httpOnly cookie and server-side session (7-day sliding).

**Scope.** Login/logout endpoints, session store in Redis, cookie options, sliding expiry, login logging never containing the password.

**Acceptance criteria**

- Given valid credentials, When signing in, Then a session is stored in Redis and an httpOnly cookie is set (HR-F010-AC2, AC12).
- Given an active session, When a request is made, Then expiry extends to 7 days (HR-F010-AC13).
- Given a login request with a password, When logs are inspected, Then the password does not appear (HR-F012-AC12).

**Out of scope.** Lockout, guard.

**References.** `features/hr-f010-users.md`, D13.

#### S-M4-04 · [M4] identity: generic failure and lockout

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:identity` `app:api` `P1`
- Depends on: S-M4-03

**Goal.** Brute-force protection without revealing account existence.

**Scope.** Failed-attempt counter, lock 15 min after 5 failures, uniform error.

**Acceptance criteria**

- Given wrong credentials or unknown account, When signing in, Then the same generic error returns (HR-F010-AC3).
- Given 5 failures, When another sign-in is tried within 15 minutes, Then it is refused even with the right password (HR-F010-AC15).

**Out of scope.** Guard.

**References.** `features/hr-f010-users.md` (BR7, BR14).

#### S-M4-05 · [M4] api: global authentication guard and registration disabled

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:identity` `app:api` `P1`
- Depends on: S-M4-03

**Goal.** Everything except login and health requires authentication.

**Scope.** Global guard with public decorator, no public sign-up route, e2e coverage over all existing routes.

**Acceptance criteria**

- Given an unauthenticated request to an operation other than login or health, When sent, Then 401 (HR-F010-AC5).
- Given a request to create an account publicly, When sent, Then it is rejected (HR-F010-AC4).
- Given any authenticated user, When used, Then they act as administrator (HR-F012-AC13, BR14).

**Out of scope.** Web guard.

**References.** `features/hr-f010-users.md`, D13.

#### S-M4-06 · [M4] users: change password and time zone preference

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `ctx:users` `ctx:identity` `app:api` `P1`
- Depends on: S-M4-05

**Goal.** Profile operations.

**Scope.** Change password (current required), set time zone (`UserProfile` only preference), endpoints.

**Acceptance criteria**

- Given the correct current password, When changing it, Then the new works and the old does not (HR-F010-AC8).
- Given a time zone change, When saved, Then it is stored for dates to use (HR-F010-AC9).

**Out of scope.** UI.

**References.** `features/hr-f010-users.md`, `domain/aggregates.md` (UserProfile).

#### S-M4-07 · [M4] web: login page, session handling and route guard

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M4-05, S-M0-22

**Goal.** Sign-in UI and protected routes.

**Scope.** Login route, session query, route guard redirect, logout, generic error display, Spanish copy.

**Acceptance criteria**

- Given valid credentials, When submitted, Then the user accesses the app (HR-F010-AC2).
- Given wrong credentials, When submitted, Then a generic error shows (HR-F010-AC3).
- Given no session, When opening a protected route, Then the user is redirected to login.

**Out of scope.** Profile.

**References.** `features/hr-f010-users.md`, D12.

#### S-M4-08 · [M4] web: profile page with password change and time zone

- Milestone: M4 · Users
- Parent: HR-F010 · Users and authentication
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M4-06, S-M4-07

**Goal.** Profile settings and time zone applied to dates.

**Scope.** Settings route, password form, time zone selector, date formatter using the preference.

**Acceptance criteria**

- Given a time zone set, When dates render, Then they use it (HR-F010-AC9).
- Given a short new password, When submitted, Then the error shows (HR-F010-AC14).
- Given the interface, When inspected, Then no language preference is exposed (HR-F010-BR10).

**Out of scope.** -

**References.** `features/hr-f010-users.md`, D12.

#### S-M4-09 · [M4] users: Favorite aggregate and endpoints

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `ctx:users` `app:api` `P1`
- Depends on: S-M4-05

**Goal.** Add, remove and list favorites per user.

**Scope.** `Favorite` aggregate unique `(user, property)`, idempotent add, endpoints, migration, ownership isolation.

**Acceptance criteria**

- Given an authenticated user on a property, When marking favorite, Then it is in their list (HR-F007-AC1).
- Given a favorite already set, When marking again, Then there is still one (HR-F007-AC3).
- Given two users, When one favorites, Then the other's list is unchanged (HR-F007-AC4, HR-F010-AC7).
- Given a visitor, When requesting favorites, Then access is denied (HR-F007-AC11).

**Out of scope.** Current data and merge.

**References.** `features/hr-f007-favorites-saved-searches.md`, `domain/aggregates.md` (Favorite).

#### S-M4-10 · [M4] users: favorites with current data and merge handling

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `ctx:users` `app:api` `P1`
- Depends on: S-M4-09, S-M3-12

**Goal.** Favorites list read model and PropertiesMerged consumer.

**Scope.** Favorites query joining property view (price, status, no longer available), consumer of `PropertiesMerged` deduplicating favorites, removal does not affect property.

**Acceptance criteria**

- Given all listings gone, When the list opens, Then the favorite is shown as no longer available (HR-F007-AC5).
- Given both properties favorited and then linked, When consumed, Then one favorite for the survivor (HR-F007-AC10).
- Given a favorite removed, When listed, Then absent and the property unaffected (HR-F007-AC2).

**Out of scope.** UI.

**References.** `features/hr-f007-favorites-saved-searches.md`, D20.

#### S-M4-11 · [M4] users: SavedSearch aggregate and CRUD

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `ctx:users` `app:api` `P1`
- Depends on: S-M4-05, S-M2-10

**Goal.** Saved searches with unique names per user.

**Scope.** `SavedSearch` aggregate (name, filters, sort, optional map area), create/edit/delete endpoints, unique name per user, migration.

**Acceptance criteria**

- Given an active search, When saved with a name, Then it appears with filters and sort (HR-F007-AC6).
- Given a duplicate name, When saving or renaming, Then it is rejected with a message (HR-F007-AC12).
- Given a saved search deleted, When listed, Then absent and favorites unaffected (HR-F007-AC8).
- Given edited filters, When saved, Then the new filters are stored (HR-F007-AC7).

**Out of scope.** Run.

**References.** `features/hr-f007-favorites-saved-searches.md`, `domain/aggregates.md` (SavedSearch).

#### S-M4-12 · [M4] users: run saved search against current data

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `ctx:users` `ctx:properties` `app:api` `P1`
- Depends on: S-M4-11

**Goal.** Saved searches never store results.

**Scope.** Endpoint translating stored filters into the properties query; ownership checks.

**Acceptance criteria**

- Given new matching listings, When opened, Then results include the new properties (HR-F007-AC9).
- Given another user's search id, When requested, Then access is denied (HR-F010-AC7).

**Out of scope.** UI.

**References.** `features/hr-f007-favorites-saved-searches.md` (BR6).

#### S-M4-13 · [M4] web: favorites toggle and favorites page

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M4-10, S-M1-12

**Goal.** Favorite control on list/detail and a favorites page.

**Scope.** Toggle (optimistic update), favorites route, no-longer-available marker.

**Acceptance criteria**

- Given a property page, When toggling favorite, Then it appears in the favorites page (HR-F007-AC1).
- Given a favorite removed, When refreshed, Then gone (HR-F007-AC2).

**Out of scope.** -

**References.** `features/hr-f007-favorites-saved-searches.md`, D12.

#### S-M4-14 · [M4] web: saved searches management

- Milestone: M4 · Users
- Parent: HR-F007 · Favorites and saved searches
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M4-12, S-M2-16

**Goal.** Save the current search and manage saved ones.

**Scope.** Save dialog from search screen, saved searches list, edit and delete, open applies URL state (including map area).

**Acceptance criteria**

- Given active filters, When saved, Then it is listed with those filters (HR-F007-AC6).
- Given a duplicate name, When saving, Then the message shows (HR-F007-AC12).
- Given a saved search opened later, When shown, Then results reflect current data (HR-F007-AC9).

**Out of scope.** Alerts (HR-F011, post-1.0).

**References.** `features/hr-f007-favorites-saved-searches.md`, D12.

#### S-M4-15 · [M4] Production deployment with Docker Compose

- Milestone: M4 · Users
- Parent: FOUNDATION
- Labels: `type:foundation` `infra` `P0`
- Depends on: S-M0-26, S-M4-05

**Goal.** Deploy a tagged version to the own server and roll back by tag.

**Needs definition before starting:** deployment procedure, environments and secrets management are marked to be defined in the docs.

**Scope.** Production compose file using versioned images, environment configuration, deployment and rollback procedure documented in `operations/overview.md`; nothing exposed without authentication.

**Acceptance criteria**

- Given a release tag, When deployed, Then the stack runs that exact version.
- Given a previous tag, When rolled back, Then the previous version runs.
- Given the deployed stack, When accessed unauthenticated, Then only login and health respond.

**Out of scope.** Other servers/platforms. Production alerting is wired later (S-M5-12); until then the observability baseline (S-M0-24, S-M0-25) applies.

**References.** `operations/overview.md`, D8, `odd/tasks/roadmap.md` R1.

#### S-M4-16 · [M4] Backups and recovery

- Milestone: M4 · Users
- Parent: FOUNDATION
- Labels: `type:foundation` `type:docs` `infra` `P0`
- Depends on: S-M4-15

**Goal.** Recoverable data for PostgreSQL.

**Needs definition before starting:** strategy, frequency, retention and storage location.

**Scope.** Backup job and restore procedure documented and tested.

**Acceptance criteria**

- Given a backup, When restored into a clean instance, Then data matches and the app boots.

**Out of scope.** -

**References.** `operations/overview.md` (Backups and recovery), D8.

### M5 · Automated ingestion

#### S-M5-01 · [M5] ingestion: IngestionRun and ExtractionError aggregates

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:ingestion` `app:api` `P0`
- Depends on: S-M0-23, S-M1-04

**Goal.** Run records with outcome and counts, plus recorded extraction errors.

**Scope.** `IngestionRun` (start, end, outcome, discovered/updated/unchanged/failed counts), `ExtractionError` (source, listing identity, cause), events `IngestionRunCompleted`/`IngestionRunFailed`, migrations, repositories.

**Acceptance criteria**

- Given an enabled source, When its run starts, Then a run record exists and on completion has outcome and counts (HR-F001-AC4).
- Given an extraction error, When logged, Then source, listing identity when known and cause are recorded (HR-F001-BR8).

**Out of scope.** Scheduling, retries.

**References.** `features/hr-f001-ingestion.md`, `domain/aggregates.md` (IngestionRun).

#### S-M5-02 · [M5] ingestion: source enable/disable gated by terms review

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `ctx:ingestion` `app:api` `P2`
- Depends on: S-M5-01

**Goal.** Sources stay disabled until their terms are reviewed.

**Scope.** `Source` terms-reviewed flag, enable/disable commands, endpoints.

**Acceptance criteria**

- Given an unauthorized source, When an administrator tries to enable it, Then it stays disabled with the reason (HR-F001-AC10, HR-F012-AC9).
- Given an enabled source disabled, When schedules evaluate, Then no run starts for it (HR-F012-AC10).

**Out of scope.** Scheduler.

**References.** `features/hr-f001-ingestion.md` (BR2), `features/hr-f012-admin-observability.md`, D3.

#### S-M5-03 · [M5] ingestion: connector port, scheduling and fan-out

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:ingestion` `P0`
- Depends on: S-M5-01, S-M5-02

**Goal.** Run scheduling separated from execution.

**Scope.** Connector port, repeatable `sync-source(<source>)` jobs, per-source queue with rate limiter, `fetch-listing` fan-out, deterministic job ids, configurable cadence (default daily) and backoff via env.

**Acceptance criteria**

- Given default config, When a day passes, Then a new run starts (HR-F001-AC14).
- Given changed cadence, retries or backoff, When the next run is scheduled, Then new values apply (HR-F001-AC15).
- Given N replicas, When a run fans out, Then no job is processed twice (D23).

**Out of scope.** Retry logic, connectors.

**References.** `features/hr-f001-ingestion.md`, D7, D23, `architecture/ingestion-concurrency.mdx`.

#### S-M5-04 · [M5] ingestion: retry policy with temporary and permanent errors

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:ingestion` `P0`
- Depends on: S-M5-03

**Goal.** Retries with exponential backoff only for temporary errors.

**Scope.** Error classification, 3 retries exponential by default, recording of retries and permanent failures.

**Acceptance criteria**

- Given a temporary error then success, When retried, Then the run succeeds and the retry is recorded (HR-F001-AC5).
- Given a permanent error, When detected, Then it is recorded with source and cause and not retried (HR-F001-AC6).
- Given defaults, When a temporary error repeats, Then up to 3 retries with exponential backoff occur (HR-F001-AC13).

**Out of scope.** Connectors.

**References.** `features/hr-f001-ingestion.md` (BR8, BR16).

#### S-M5-05 · [M5] ingestion: automatic observations and disappearance after N runs

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `ctx:listings` `app:ingestion` `P0`
- Depends on: S-M5-04, S-M3-05

**Goal.** Runs record observations and mark listings disappeared.

**Scope.** Observation per seen listing (unique per listing+run), last check update, unseen counter and `disappeared` after N runs (env, default 3).

**Acceptance criteria**

- Given an active automatic listing absent for N runs, When the Nth run ends, Then status becomes `disappeared`; with fewer it stays active (HR-F001-AC7).
- Given N = 3, When unseen thrice, Then a disappearance is in its history (HR-F008-AC7).
- Given a listing seen again, When observed, Then it can reappear.

**Out of scope.** Connectors.

**References.** `features/hr-f001-ingestion.md` (BR9), D20.

#### S-M5-06 · [M5] ingestion: idealista Search API client and authentication

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:ingestion` `P0`
- Depends on: S-M5-03

**Goal.** HTTP client for the authorized idealista API behind the connector port.

**Needs definition before starting:** depends on the idealista access key being granted (HR-F001-BR3) and on its terms of use.

**Scope.** Client, credentials from env, rate limit per source queue, contract tests against recorded fixtures.

**Acceptance criteria**

- Given recorded responses, When the client runs, Then items are mapped to raw payloads.
- Given an API error, When it occurs, Then it is classified temporary or permanent.

**Out of scope.** Mapping (S-M5-07).

**References.** `features/hr-f001-ingestion.md` (BR2, BR3), D3.

#### S-M5-07 · [M5] ingestion: idealista mapper to the normalized model and upsert

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `ctx:listings` `app:ingestion` `P0`
- Depends on: S-M5-06, S-M5-05

**Goal.** Ingest idealista results as listings.

**Needs definition before starting:** depends on S-M5-06 access key.

**Scope.** Mapper to normalized fields (unknown when missing), use case upserting by source+external id, counts per run.

**Acceptance criteria**

- Given payloads from two sources, When normalized, Then both produce the same field set (HR-F002-AC1).
- Given the same identity delivered again, When ingested, Then the listing is updated, none created (HR-F001-AC3).

**Out of scope.** Images policy.

**References.** `features/hr-f001-ingestion.md`, `features/hr-f002-normalization.md`, D20.

#### S-M5-08 · [M5] ingestion: per-source image storage policy

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `ctx:listings` `app:ingestion` `P0`
- Depends on: S-M5-07

**Goal.** Images only where source terms allow.

**Scope.** Source capability flag, ingestion skipping image storage, link to original always kept.

**Acceptance criteria**

- Given a source that does not allow images, When a listing is ingested, Then no image is stored and the link is kept (HR-F001-AC9).

**Out of scope.** Gallery UI.

**References.** `features/hr-f001-ingestion.md` (BR10), `features/hr-f004-property-detail.md` (BR7).

#### S-M5-09 · [M5] ingestion: authorized local-agency feed connector (Santiago)

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `app:ingestion` `P0`
- Depends on: S-M5-05

**Goal.** Second automatic source after idealista.

**Needs definition before starting:** which feeds are authorized, their format and terms (not specified in the sources).

**Scope.** Feed connector behind the port with mapper and fixtures.

**Acceptance criteria**

- Given a sample feed, When a run executes, Then listings are ingested and counted.
- Given an unreviewed source, When enabling is attempted, Then it stays disabled (HR-F001-AC10).

**Out of scope.** -

**References.** `features/hr-f001-ingestion.md` (BR3), D3.

#### S-M5-10 · [M5] ingestion: concurrency integration spec (collisions are harmless)

- Milestone: M5 · Automated ingestion
- Parent: HR-F001 · Listing ingestion
- Labels: `type:feature` `ctx:ingestion` `ctx:listings` `app:ingestion` `P0`
- Depends on: S-M5-07

**Goal.** Prove D23 guarantees under parallel workers.

**Scope.** Integration spec with several workers ingesting overlapping listings on Testcontainers; unique constraints and upsert behavior.

**Acceptance criteria**

- Given overlapping jobs, When processed concurrently, Then one listing per identity and unique observation per (listing, run) exist.

**Out of scope.** -

**References.** `architecture/ingestion-concurrency.mdx`, D23.

#### S-M5-11 · [M5] Metrics: runs, durations, errors and queue depth

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `app:ingestion` `infra` `P1`
- Depends on: S-M5-04, S-M0-25

**Goal.** Operational metrics to Prometheus.

**Scope.** OTel metrics for runs, duration, outcomes, errors, queue depth; Grafana dashboard for ingestion.

**Acceptance criteria**

- Given a completed run, When scraped, Then metrics include the run, duration and outcome (HR-F012-AC2).

**Out of scope.** Alerts.

**References.** `features/hr-f012-admin-observability.md` (BR2), D15.

#### S-M5-12 · [M5] Grafana alerts: the three first-release alerts

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `infra` `P1`
- Depends on: S-M5-11

**Goal.** Exactly three alerts as code.

**Needs definition before starting:** thresholds, evaluation windows and notification channels.

**Scope.** Provisioned Grafana alert rules: no successful ingestion run, extraction error rate, failing health checks.

**Acceptance criteria**

- Given a failed run condition, When rules are evaluated, Then an alert is raised (HR-F012-AC5).
- Given the alert list, When inspected, Then exactly three exist (HR-F012-AC14).

**Out of scope.** Runbooks.

**References.** `features/hr-f012-admin-observability.md`, `operations/overview.md`, D15.

#### S-M5-13 · [M5] Bull Board behind authentication

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `app:ingestion` `app:api` `P1`
- Depends on: S-M4-05, S-M5-03

**Goal.** Queue inspection for authenticated users only.

**Needs definition before starting:** how Bull Board (in ingestion) is exposed through the API-managed session.

**Scope.** Bull Board mounted with the session guard.

**Acceptance criteria**

- Given a visitor, When requesting Bull Board, Then access is denied (HR-F012-AC6).
- Given an authenticated user, When opened, Then pending, running and failed jobs are visible.

**Out of scope.** -

**References.** `features/hr-f012-admin-observability.md` (BR5, BR10), D7.

#### S-M5-14 · [M5] API admin: connectors, runs, errors, processed listings, statistics

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `ctx:ingestion` `app:api` `P2`
- Depends on: S-M5-05, S-M4-05

**Goal.** Read endpoints for the administration area.

**Scope.** Queries: connector status with latest run, runs list with counts, extraction errors, processed listings, per-source statistics (discovered, updated, failed, error rate), effective settings.

**Acceptance criteria**

- Given several connectors, When requested, Then each has status and latest run (HR-F012-AC7).
- Given extraction errors, When requested, Then each shows source, time and cause (HR-F012-AC11).
- Given settings, When requested, Then the disappearance threshold shows its effective value (HR-F012-BR13).

**Out of scope.** Actions, UI.

**References.** `features/hr-f012-admin-observability.md`.

#### S-M5-15 · [M5] API admin: retry failed run

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `ctx:ingestion` `app:api` `P2`
- Depends on: S-M5-14

**Goal.** Retry linked to the failed run.

**Scope.** `RetryRun` command, queue pending jobs view, new run linked to the failed one.

**Acceptance criteria**

- Given a failed run, When retry is selected, Then a new run is queued and linked (HR-F012-AC8).

**Out of scope.** UI.

**References.** `features/hr-f012-admin-observability.md` (BR7).

#### S-M5-16 · [M5] web: administration area (connectors, runs, errors, statistics)

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `app:web` `P2`
- Depends on: S-M5-14

**Goal.** Read views of ingestion state.

**Scope.** Admin routes under settings, connectors, runs, errors, per-source statistics, settings values.

**Acceptance criteria**

- Given several connectors, When the area opens, Then status and latest run show (HR-F012-AC7).
- Given errors, When the view opens, Then source, time and cause show (HR-F012-AC11).

**Out of scope.** Actions.

**References.** `features/hr-f012-admin-observability.md`, `features/hr-f010-users.md` (BR11), D12.

#### S-M5-17 · [M5] web: admin actions (enable/disable source, retry run)

- Milestone: M5 · Automated ingestion
- Parent: HR-F012 · Administration and observability
- Labels: `type:feature` `app:web` `P2`
- Depends on: S-M5-15, S-M5-16, S-M5-02

**Goal.** Operate sources and runs.

**Scope.** Enable/disable with terms warning and reason, retry button, pending jobs view.

**Acceptance criteria**

- Given an unreviewed source, When enabling is tried, Then it stays disabled and the reason shows (HR-F012-AC9).
- Given a failed run, When retry is selected, Then a new run is queued (HR-F012-AC8).

**Out of scope.** -

**References.** `features/hr-f012-admin-observability.md`.

### M6 · Dashboard → Release 1.0

#### S-M6-01 · [M6] API dashboard: totals, new listings and active scope

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `ctx:properties` `app:api` `P1`
- Depends on: S-M1-08

**Goal.** Counts over collected and active properties.

**Scope.** Dashboard queries: collected properties, active listings, new listings in the last 7 days; statistics scoped to active properties.

**Acceptance criteria**

- Given 10 properties, 8 active, When requested, Then total is 10 and statistics refer to 8 (HR-F009-AC1).
- Given listings first observed 5 and 10 days ago, When requested, Then only the first is new (HR-F009-AC12).
- Given a listing disappears, When recalculated, Then it no longer counts (HR-F009-AC9).

**Out of scope.** Price stats.

**References.** `features/hr-f009-dashboard.md`, D19, D20.

#### S-M6-02 · [M6] API dashboard: price, price per m2 and area statistics with sample size

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `ctx:properties` `app:api` `P1`
- Depends on: S-M6-01

**Goal.** Averages and medians with sample sizes and small-sample flag.

**Scope.** Average and median representative price, average price per m2 (built area only), average built area; sample size and provenance per statistic; small-sample flag under 5.

**Acceptance criteria**

- Given prices 100k, 200k, 600k, When requested, Then average 300k and median 200k (HR-F009-AC2).
- Given 4 properties, one without built area, When price per m2 is requested, Then computed over 3 with sample 3 (HR-F009-AC3).
- Given a statistic over 4 properties, When returned, Then it is flagged small-sample (HR-F009-AC14).
- Given any statistic, When returned, Then it carries sample size and provenance (HR-F009-AC4).

**Out of scope.** Distributions.

**References.** `features/hr-f009-dashboard.md`, D19, D20.

#### S-M6-03 · [M6] API dashboard: distributions by type and geography, per municipality

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `ctx:properties` `app:api` `P1`
- Depends on: S-M6-02

**Goal.** Distribution and municipality statistics.

**Scope.** By property type (including unknown), by municipality/province from derived areas (unknown location bucket), per-municipality averages with own sample size.

**Acceptance criteria**

- Given properties of several types, When requested, Then each type has its count including unknown (HR-F009-AC6).
- Given two municipalities, When requested, Then each has its own average and sample size (HR-F009-AC7).
- Given properties without pin, When requested, Then they appear under unknown location (HR-F009-AC8).

**Out of scope.** Evolution.

**References.** `features/hr-f009-dashboard.md`, D18.

#### S-M6-04 · [M6] API dashboard: median price evolution over time

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `ctx:properties` `ctx:listings` `app:api` `P1`
- Depends on: S-M6-02, S-M3-05

**Goal.** Median series from observations.

**Scope.** Time series of the median over observations with first observation date; empty dataset returns no data.

**Acceptance criteria**

- Given observations over time, When requested, Then the series plots the median and gives the first observation date (HR-F009-AC10, AC13).
- Given no data, When requested, Then an empty result is returned (HR-F009-AC11).

**Out of scope.** UI.

**References.** `features/hr-f009-dashboard.md`, `features/hr-f008-price-history.md`.

#### S-M6-05 · [M6] web: dashboard page with cards, notices and empty state

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M6-03, S-M4-07

**Goal.** Main dashboard screen.

**Scope.** Dashboard route, stat cards with sample size and provenance, advertised-price notice, small-sample warning, empty state.

**Acceptance criteria**

- Given any statistic, When displayed, Then sample size and provenance show (HR-F009-AC4).
- Given the dashboard, When displayed, Then a notice says advertised prices are not actual sale prices (HR-F009-AC5).
- Given no data, When shown, Then an empty state replaces zeros (HR-F009-AC11).
- Given a statistic over 4 properties, When shown, Then a small-sample warning appears (HR-F009-AC14).

**Out of scope.** Charts.

**References.** `features/hr-f009-dashboard.md`, D12.

#### S-M6-06 · [M6] web: distributions and municipality statistics views

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M6-05

**Goal.** Type, geography and municipality views with textual alternatives.

**Scope.** Charts/tables with accessible text, unknown categories visible.

**Acceptance criteria**

- Given types, When shown, Then each lists its count including unknown (HR-F009-AC6).
- Given properties without pin, When shown, Then `unknown location` appears (HR-F009-AC8).
- Given municipalities, When shown, Then each has its sample size (HR-F009-AC7).

**Out of scope.** Evolution.

**References.** `features/hr-f009-dashboard.md`, D12.

#### S-M6-07 · [M6] web: price evolution chart on the dashboard

- Milestone: M6 · Dashboard → Release 1.0
- Parent: HR-F009 · Dashboard
- Labels: `type:feature` `app:web` `P1`
- Depends on: S-M6-04, S-M6-05

**Goal.** Median evolution chart.

**Scope.** Median series chart with first observation date and textual alternative.

**Acceptance criteria**

- Given observations, When shown, Then the chart plots the median (HR-F009-AC13).
- Given the chart, When shown, Then the first observation date is stated (HR-F009-AC10).

**Out of scope.** -

**References.** `features/hr-f009-dashboard.md`.

#### S-M6-08 · [M6] Ingestion runbooks

- Milestone: M6 · Dashboard → Release 1.0
- Parent: FOUNDATION
- Labels: `type:foundation` `type:docs` `P0`
- Depends on: S-M5-12

**Goal.** Runbooks for the three alerts and failed runs.

**Needs definition before starting:** runbook content depends on real incidents and thresholds.

**Scope.** Docs pages for each alert and common ingestion failures.

**Acceptance criteria**

- Given each alert, When it fires, Then a runbook describes diagnosis and action.

**Out of scope.** -

**References.** `operations/overview.md` (Ingestion runbooks), D15.

#### S-M6-09 · [M6] Release 1.0 acceptance and 1.0.0 cut

- Milestone: M6 · Dashboard → Release 1.0
- Parent: FOUNDATION
- Labels: `type:foundation` `P0`
- Depends on: S-M6-07, S-M4-15, S-M5-17

**Goal.** Close the MVP against the product scope.

**Scope.** Playwright critical flows across milestones, checklist of P0/P1 acceptance criteria, `release-as 1.0.0` via release-please.

**Acceptance criteria**

- Given the P0 and P1 acceptance criteria, When reviewed, Then each is covered by a test or marked deferred with a reason.
- Given the Release PR for 1.0.0, When merged, Then tag `v1.0.0`, release notes and images exist.

**Out of scope.** HR-F011 (post-1.0).

**References.** `odd/tasks/roadmap.md` R1, R5, `features/index.md`.

## 5. Summary

| Milestone | Parent issues | Slice issues |
|---|---|---|
| M0 · Foundation | 1 | 26 |
| M1 · Walking skeleton | 3 | 14 |
| M2 · Search & map | 2 | 16 |
| M3 · History & duplicates | 2 | 14 |
| M4 · Users | 2 | 16 |
| M5 · Automated ingestion | 1 | 17 |
| M6 · Dashboard → Release 1.0 | 1 | 9 |
| No milestone (HR-F011) | 1 | 0 |
| **Total** | **13** | **112** |

## 6. GitHub mapping (created 2026-11-20)

Project board: https://github.com/users/JSisques/projects/16 (linked to the repository). Every slice is a sub-issue of its parent; plan IDs in issue bodies were replaced by issue references.

| Plan ID | Issue |
|---|---|
| `FOUNDATION` | #3 |
| `HR-F001` | #4 |
| `HR-F002` | #5 |
| `HR-F003` | #6 |
| `HR-F004` | #7 |
| `HR-F005` | #8 |
| `HR-F006` | #9 |
| `HR-F007` | #10 |
| `HR-F008` | #11 |
| `HR-F009` | #12 |
| `HR-F010` | #13 |
| `HR-F011` | #14 |
| `HR-F012` | #15 |
| `S-M0-01` | #16 |
| `S-M0-02` | #17 |
| `S-M0-03` | #18 |
| `S-M0-04` | #19 |
| `S-M0-05` | #20 |
| `S-M0-06` | #21 |
| `S-M0-07` | #22 |
| `S-M0-08` | #23 |
| `S-M0-09` | #24 |
| `S-M0-10` | #25 |
| `S-M0-11` | #26 |
| `S-M0-12` | #27 |
| `S-M0-13` | #28 |
| `S-M0-14` | #29 |
| `S-M0-15` | #30 |
| `S-M0-16` | #31 |
| `S-M0-17` | #32 |
| `S-M0-18` | #33 |
| `S-M0-19` | #34 |
| `S-M0-20` | #35 |
| `S-M0-21` | #36 |
| `S-M0-22` | #37 |
| `S-M0-23` | #38 |
| `S-M0-24` | #39 |
| `S-M0-25` | #40 |
| `S-M0-26` | #41 |
| `S-M0-27` | #148 |
| `S-M1-01` | #42 |
| `S-M1-02` | #43 |
| `S-M1-03` | #44 |
| `S-M1-04` | #45 |
| `S-M1-05` | #46 |
| `S-M1-06` | #47 |
| `S-M1-07` | #48 |
| `S-M1-08` | #49 |
| `S-M1-09` | #50 |
| `S-M1-10` | #51 |
| `S-M1-11` | #52 |
| `S-M1-12` | #53 |
| `S-M1-13` | #54 |
| `S-M1-14` | #55 |
| `S-M2-01` | #56 |
| `S-M2-02` | #57 |
| `S-M2-03` | #58 |
| `S-M2-04` | #59 |
| `S-M2-05` | #60 |
| `S-M2-06` | #61 |
| `S-M2-07` | #62 |
| `S-M2-08` | #63 |
| `S-M2-09` | #64 |
| `S-M2-10` | #65 |
| `S-M2-11` | #66 |
| `S-M2-12` | #67 |
| `S-M2-13` | #68 |
| `S-M2-14` | #69 |
| `S-M2-15` | #70 |
| `S-M2-16` | #71 |
| `S-M3-01` | #72 |
| `S-M3-02` | #73 |
| `S-M3-03` | #74 |
| `S-M3-04` | #75 |
| `S-M3-05` | #76 |
| `S-M3-06` | #77 |
| `S-M3-07` | #78 |
| `S-M3-08` | #79 |
| `S-M3-09` | #80 |
| `S-M3-10` | #81 |
| `S-M3-11` | #82 |
| `S-M3-12` | #83 |
| `S-M3-13` | #84 |
| `S-M3-14` | #85 |
| `S-M4-01` | #86 |
| `S-M4-02` | #87 |
| `S-M4-03` | #88 |
| `S-M4-04` | #89 |
| `S-M4-05` | #90 |
| `S-M4-06` | #91 |
| `S-M4-07` | #92 |
| `S-M4-08` | #93 |
| `S-M4-09` | #94 |
| `S-M4-10` | #95 |
| `S-M4-11` | #96 |
| `S-M4-12` | #97 |
| `S-M4-13` | #98 |
| `S-M4-14` | #99 |
| `S-M4-15` | #100 |
| `S-M4-16` | #101 |
| `S-M0-27` | #130 (added 2026-11-20, ADR D36) |
| `S-M5-18` | #132 (added 2026-11-20, ADR D37) |
| `S-M5-19` | #133 (added 2026-11-20, ADR D37) |
| `S-M5-20` | #134 (added 2026-11-20, ADR D37) |
| `S-M5-21` | #135 (added 2026-11-20, ADR D37) |
| `S-M5-01` | #102 |
| `S-M5-02` | #103 |
| `S-M5-03` | #104 |
| `S-M5-04` | #105 |
| `S-M5-05` | #106 |
| `S-M5-06` | #107 |
| `S-M5-07` | #108 |
| `S-M5-08` | #109 |
| `S-M5-09` | #110 |
| `S-M5-10` | #111 |
| `S-M5-11` | #112 |
| `S-M5-12` | #113 |
| `S-M5-13` | #114 |
| `S-M5-14` | #115 |
| `S-M5-15` | #116 |
| `S-M5-16` | #117 |
| `S-M5-17` | #118 |
| `S-M6-01` | #119 |
| `S-M6-02` | #120 |
| `S-M6-03` | #121 |
| `S-M6-04` | #122 |
| `S-M6-05` | #123 |
| `S-M6-06` | #124 |
| `S-M6-07` | #125 |
| `S-M6-08` | #126 |
| `S-M6-09` | #127 |
