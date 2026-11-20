---
title: Architecture overview
description: Monorepo structure, bounded contexts, ports and adapters, and runtime services.
sidebar:
  order: 1
---

## Monorepo structure

Decision [D2](/adr/d02-repository-strategy/): a single `house-radar` monorepo (pnpm workspaces + Turborepo) with code, infrastructure, and documentation.

```text
house-radar/
├── apps/
│   ├── api/          # Backend API
│   ├── web/          # Frontend: search, property pages, map, dashboard
│   ├── ingestion/    # Collection workers and connectors
│   └── docs/         # Documentation portal (Astro)
├── packages/
│   └── domain/       # Shared normalized model
└── infra/            # Docker Compose and deployment configuration
```

| Module | Technology | Decision |
| --- | --- | --- |
| `apps/api` | NestJS with DDD | [D4](/adr/d04-backend-framework/) |
| `apps/ingestion` | NestJS with DDD, BullMQ + Redis | [D4](/adr/d04-backend-framework/), [D7](/adr/d07-queues-and-scheduling/) |
| `apps/web` | React + Vite (SPA), i18n-ready | [D5](/adr/d05-frontend-framework/), [D12](/adr/d12-web-internationalization/) |
| `apps/docs` | Astro + Starlight | [D11](/adr/d11-documentation-portal/) |
| `packages/domain` | Shared normalized model | [D1](/adr/d01-language/), [D2](/adr/d02-repository-strategy/) |
| `infra` | Docker Compose | [D8](/adr/d08-deployment/) |

Module boundaries are enforced by the architecture (packages and explicit dependencies) and verified in CI ([D16](/adr/d16-quality-and-workflow/)).

## Bounded context candidates

Decision [D4](/adr/d04-backend-framework/) organizes the backend by bounded contexts. Examples listed in the decision log:

- `listings`
- `properties`
- `pricing-history`
- `ingestion`
- `users`

Decision [D13](/adr/d13-users-and-authentication/) names the `identity` bounded context for authentication.

Each context has domain, application, and infrastructure layers. The domain does not depend on NestJS: decorators, modules, and dependency injection are limited to the application and infrastructure layers.

## Ports and adapters

Decision [D10](/adr/d10-cross-cutting-architecture/): DDD with ports and adapters in both backend and frontend. Every external library (ORM, queues, map, charts, HTTP) is accessed through an adapter.

Examples in the decision log:

- Map port in the frontend; MapLibre GL is its first adapter ([D9](/adr/d09-map/)).
- The i18n library behind an adapter ([D12](/adr/d12-web-internationalization/)).
- Authentication exposed through a port; OIDC or a SaaS would be a new adapter ([D13](/adr/d13-users-and-authentication/)).
- OpenTelemetry instrumentation behind an adapter ([D15](/adr/d15-observability/)).
- MikroORM mapped with `EntitySchema`, so domain entities do not depend on it ([D6](/adr/d06-persistence/)).

## Ingestion concurrency

How ingestion workers scale without collisions and respect per-source quotas is described in [Ingestion concurrency](/architecture/ingestion-concurrency/) ([D23](/adr/d23-ingestion-concurrency-model/)).

## Runtime services

All services run with Docker Compose ([D8](/adr/d08-deployment/)).

| Service | Purpose | Decision |
| --- | --- | --- |
| PostgreSQL + PostGIS | Persistence and spatial queries | [D6](/adr/d06-persistence/) |
| Redis | Queues and scheduling (BullMQ) | [D7](/adr/d07-queues-and-scheduling/) |
| OpenTelemetry Collector | Telemetry collection | [D15](/adr/d15-observability/) |
| Prometheus | Metrics | [D15](/adr/d15-observability/) |
| Loki | Logs | [D15](/adr/d15-observability/) |
| Tempo | Traces | [D15](/adr/d15-observability/) |
| Grafana | Dashboards and alerts | [D15](/adr/d15-observability/) |

## C4 diagrams

To be defined.
