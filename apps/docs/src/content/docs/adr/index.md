---
title: "Architecture decision records"
description: "Index of all architecture decisions D0 to D38."
sidebar:
  order: 0
---

Product and technical decisions taken before development started. Each decision in the decision log is documented as an ADR whose identifier matches the log (D0 to D38). The ADR numbering is the decision number. Use the [template](/adr/template/) for new decisions.

| ID | Decision | Result | Date |
| --- | --- | --- | --- |
| D0 | [Project purpose](/adr/d00-project-purpose/) | A personal tool built to real-product standards; it serves as a portfolio and may evolve into a public product. | 2026-11-20 |
| D1 | [Language](/adr/d01-language/) | TypeScript end to end (API, web, ingestion). Python for ingestion remains an option in V2 if justified. | 2026-11-20 |
| D2 | [Repository strategy](/adr/d02-repository-strategy/) | A single `house-radar` monorepo (pnpm workspaces + Turborepo) containing code, infrastructure, and documentation. | 2026-11-20 |
| D3 | [Source strategy](/adr/d03-source-strategy/) | First target source: idealista Search API (official, access on request). Provisional MVP source: manual import by URL. Second candidate source: authorized feeds from local real estate agencies in Santiago. | 2026-11-20 |
| D4 | [Backend framework](/adr/d04-backend-framework/) | NestJS with DDD for `apps/api` and `apps/ingestion`. Code conventions will be defined later in the repository. | 2026-11-20 |
| D5 | [Frontend framework](/adr/d05-frontend-framework/) | React + Vite (SPA) for `apps/web`. SSR of property pages is postponed until a possible publication. | 2026-11-20 |
| D6 | [Persistence](/adr/d06-persistence/) | PostgreSQL + PostGIS with MikroORM (Data Mapper + Unit of Work). | 2026-11-20 |
| D7 | [Queues and scheduling](/adr/d07-queues-and-scheduling/) | BullMQ + Redis (`@nestjs/bullmq`) for running ingestion. | 2026-11-20 |
| D8 | [Deployment](/adr/d08-deployment/) | Own server with Docker Compose. Platform-agnostic deployment: the same Compose setup must be movable to a VPS without changes. | 2026-11-20 |
| D9 | [Map](/adr/d09-map/) | MapLibre GL (`react-map-gl`) behind an adapter, replaceable without affecting the rest. | 2026-11-20 |
| D10 | [Cross-cutting architecture](/adr/d10-cross-cutting-architecture/) | DDD with ports and adapters in both backend and frontend. Every external library (ORM, queues, map, charts, HTTP) is accessed through an adapter. | 2026-11-20 |
| D11 | [Documentation portal](/adr/d11-documentation-portal/) | Astro + Starlight in `apps/docs`, bilingual (Spanish and English) with i18n. English is the source of truth (default locale); Spanish is a translation. | 2026-11-20 |
| D12 | [Web internationalization](/adr/d12-web-internationalization/) | `apps/web` is prepared for i18n from the start; the first release only includes Spanish. Galician, Catalan, and other languages will be added as translations. | 2026-11-20 |
| D13 | [Users and authentication](/adr/d13-users-and-authentication/) | Own authentication in NestJS (`identity` bounded context), registration disabled and a single account created through a seed. | 2026-11-20 |
| D14 | [Testing](/adr/d14-testing/) | Strict TDD (red, green, refactor). Vitest (unit), Testing Library (components), Testcontainers with real Postgres + PostGIS and Redis (integration), and Playwright (E2E for critical flows). | 2026-11-20 |
| D15 | [Observability](/adr/d15-observability/) | Full stack from the MVP: OpenTelemetry (Collector) to Prometheus (metrics), Loki (logs), Tempo (traces), and Grafana (dashboards and alerts). Structured logs with Pino, health checks with `@nestjs/terminus`, and Bull Board for jobs. | 2026-11-20 |
| D16 | [Quality and workflow](/adr/d16-quality-and-workflow/) | GitHub Actions (lint, typecheck, test, and build of affected packages with Turborepo), architectural boundaries verified in CI, Conventional Commits with commitlint, short feature branches with a PR to `main`, Node and pnpm versions pinned in the repository, and dependency updates proposed by Renovate as exact-pinned PRs checked by CI. | 2026-11-20 |
| D17 | [Manual import as an assisted form](/adr/d17-manual-import-assisted-form/) | Manual import is an assisted form: the URL is stored as provenance and all data is entered by hand. No content is extracted from the page. | 2026-11-20 |
| D18 | [Location as a pin with declared precision](/adr/d18-location-pin-declared-precision/) | Pin on a map with declared precision (`exact`, `approximate`, `municipality`). Municipality and province derived from official IGN boundaries with PostGIS; geocoding deferred. | 2026-11-20 |
| D19 | [Search read model](/adr/d19-search-read-model/) | Search results are properties, not listings. Representative price is the lowest among the property's active listings. | 2026-11-20 |
| D20 | [Listing consolidation rules](/adr/d20-listing-consolidation-rules/) | Conflicts flagged with the most recent value, price history per listing, manual observations, disappearance rules, price per m² on built area only, and statistics over active properties with sample size. | 2026-11-20 |
| D21 | [Duplicate detection policy](/adr/d21-duplicate-detection-policy/) | The system suggests candidates and never merges automatically; the user resolves each one. Thresholds are configurable. | 2026-11-20 |
| D22 | [API style](/adr/d22-api-style/) | REST over HTTP described by an OpenAPI contract; the web uses a generated typed TypeScript client behind a port. | 2026-11-20 |
| D23 | [Ingestion concurrency model](/adr/d23-ingestion-concurrency-model/) | Scale work, not workers per source: stateless identical workers, fan-out per listing, one rate-limited queue per source, and idempotency (unique constraint, append-only observations, optimistic locking) instead of distributed locks. | 2026-11-20 |
| D24 | [Own building blocks](/adr/d24-own-building-blocks/) | Two own framework-free packages (`building-blocks`, `shared-kernel`) instead of the author's external DDD kit, which couples the domain to NestJS and TypeORM. | 2026-11-20 |
| D25 | [CQRS and context structure](/adr/d25-cqrs-and-context-structure/) | CQRS with `@nestjs/cqrs` and a per-context layout (`domain`, `application`, `infrastructure`, `transport`); contexts talk through ports and events. | 2026-11-20 |
| D26 | [TanStack Router](/adr/d26-tanstack-router/) | TanStack Router in `apps/web`, with search params typed and validated with zod in the route definition. | 2026-11-20 |
| D27 | [react-i18next](/adr/d27-react-i18next/) | `react-i18next` behind the i18n adapter: one namespace per context, typed keys, and `Intl` for formatting. | 2026-11-20 |
| D28 | [Bounded context map](/adr/d28-bounded-context-map/) | Six contexts (`ingestion`, `listings`, `properties`, `geography`, `identity`, `users`) with explicit ports and events; `pricing-history` is not a context. | 2026-11-20 |
| D29 | [Aggregate boundaries](/adr/d29-aggregate-boundaries/) | `Observation` and `ExtractionError` as own append-only aggregates, a minimal `Property`, and derived consolidation data in projections. | 2026-11-20 |
| D30 | [One PostgreSQL schema per context](/adr/d30-schema-per-context/) | One schema per bounded context, no cross-schema foreign keys, and cross-context reads through projections. | 2026-11-20 |
| D31 | [Transactional outbox](/adr/d31-transactional-outbox/) | Domain events are written to `outbox_event` in the aggregate's transaction; a relay publishes through BullMQ and consumers are idempotent. | 2026-11-20 |
| D32 | [UUIDv7 identifiers](/adr/d32-uuid-v7/) | Time-ordered UUIDv7 for aggregate, event and outbox IDs, generated with the `uuid` package. | 2026-11-20 |
| D33 | [Versioning and releases](/adr/d33-versioning-and-releases/) | One product version for the monorepo with release-please (Release PR, `0.x` until Release 1.0) and Docker images tagged with version and commit SHA. | 2026-11-20 |
| D34 | [Visual direction](/adr/d34-visual-direction/) | "Folla catastral": a surveyor's data-sheet identity with a cool fog-grey palette, three typefaces, and a cartographic hatch that draws unknown values instead of hiding them. | 2026-11-20 |
| D35 | [Environments and staging deployment](/adr/d35-environments-and-staging-deployment/) | Local, CI, a disposable staging reachable only through Tailscale and an undefined production; images in GHCR, automatic deploy on merge, secrets in GitHub Environments, per-service health checks and rollback. | 2026-11-20 |
| D36 | [Docs hosting on Cloudflare Pages](/adr/d36-docs-hosting-cloudflare-pages/) | The docs portal is published on Cloudflare Pages at the root of its pages.dev domain, with a preview per pull request. | 2026-11-20 |
| D37 | [Fotocasa detail-page connector](/adr/d37-fotocasa-detail-connector/) | A connector reads individual Fotocasa listing pages (user import and daily refresh of tracked listings) honoring robots.txt, for private use only and disabled in production. Automatic discovery is deferred. | 2026-11-20 |
| D38 | [Persistence rows defined with defineEntity](/adr/d38-persistence-row-definition/) | Rows stay as MikroORM schemas declared with `defineEntity`; the row type is inferred from the schema and decorated row classes are not adopted. | 2026-11-25 |
