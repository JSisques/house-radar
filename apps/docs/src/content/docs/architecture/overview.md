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
| `packages/building-blocks` | Generic DDD building blocks (framework-free) | [D24](/adr/d24-own-building-blocks/) |
| `packages/shared-kernel` | House Radar concepts shared by two or more contexts | [D24](/adr/d24-own-building-blocks/), [D1](/adr/d01-language/), [D2](/adr/d02-repository-strategy/) |
| `infra` | Docker Compose | [D8](/adr/d08-deployment/) |

Module boundaries are enforced by the architecture (packages and explicit dependencies) and verified in CI ([D16](/adr/d16-quality-and-workflow/)).

## Bounded contexts

Decision [D4](/adr/d04-backend-framework/) organizes the backend by bounded contexts, and [D28](/adr/d28-bounded-context-map/) fixes the map: `ingestion`, `listings`, `properties`, `geography`, `identity` and `users`. See [Context map](/architecture/context-map/), [Aggregates](/domain/aggregates/) and [Database schema](/architecture/database-schema/).

The candidates listed in the decision log were:

- `listings`
- `properties`
- `pricing-history`
- `ingestion`
- `users`

Decision [D13](/adr/d13-users-and-authentication/) names the `identity` bounded context for authentication. `pricing-history` did not become a context: price history is the observations of `listings` ([D28](/adr/d28-bounded-context-map/)).

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

## Code conventions

Structure, layering, naming, testing and tooling rules for backend, frontend and shared packages are in [Code conventions](/architecture/conventions/).

The visual system (palette, typography, the hatch for unknown values) is in [Design system](/architecture/design-system/) ([D34](/adr/d34-visual-direction/)).

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
