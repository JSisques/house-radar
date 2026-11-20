---
title: Visión general de la arquitectura
description: Estructura del monorepo, bounded contexts, puertos y adaptadores, y servicios en ejecución.
sidebar:
  order: 1
---

## Estructura del monorepo

Decisión [D2](/es/adr/d02-repository-strategy/): monorepo único `house-radar` (pnpm workspaces + Turborepo) con código, infraestructura y documentación.

```text
house-radar/
├── apps/
│   ├── api/          # API backend
│   ├── web/          # Frontend: buscador, fichas, mapa, dashboard
│   ├── ingestion/    # Workers de recopilación y conectores
│   └── docs/         # Portal de documentación (Astro)
├── packages/
│   └── domain/       # Modelo normalizado compartido
└── infra/            # Docker Compose y configuración de despliegue
```

| Módulo | Tecnología | Decisión |
| --- | --- | --- |
| `apps/api` | NestJS con DDD | [D4](/es/adr/d04-backend-framework/) |
| `apps/ingestion` | NestJS con DDD, BullMQ + Redis | [D4](/es/adr/d04-backend-framework/), [D7](/es/adr/d07-queues-and-scheduling/) |
| `apps/web` | React + Vite (SPA), preparado para i18n | [D5](/es/adr/d05-frontend-framework/), [D12](/es/adr/d12-web-internationalization/) |
| `apps/docs` | Astro + Starlight | [D11](/es/adr/d11-documentation-portal/) |
| `packages/domain` | Modelo normalizado compartido | [D1](/es/adr/d01-language/), [D2](/es/adr/d02-repository-strategy/) |
| `infra` | Docker Compose | [D8](/es/adr/d08-deployment/) |

Los límites entre módulos los impone la arquitectura (paquetes y dependencias explícitas) y se verifican en CI ([D16](/es/adr/d16-quality-and-workflow/)).

## Candidatos a bounded contexts

La decisión [D4](/es/adr/d04-backend-framework/) organiza el backend por bounded contexts. Ejemplos del registro de decisiones:

- `listings`
- `properties`
- `pricing-history`
- `ingestion`
- `users`

La decisión [D13](/es/adr/d13-users-and-authentication/) nombra el bounded context `identity` para la autenticación.

Cada contexto tiene capas de dominio, aplicación e infraestructura. El dominio no depende de NestJS: decoradores, módulos e inyección de dependencias se limitan a las capas de aplicación e infraestructura.

## Puertos y adaptadores

Decisión [D10](/es/adr/d10-cross-cutting-architecture/): DDD con puertos y adaptadores tanto en backend como en frontend. Toda librería externa (ORM, colas, mapa, gráficas, HTTP) se accede mediante un adaptador.

Ejemplos del registro de decisiones:

- Puerto de mapa en el frontend; MapLibre GL es su primer adaptador ([D9](/es/adr/d09-map/)).
- La librería de i18n detrás de un adaptador ([D12](/es/adr/d12-web-internationalization/)).
- Autenticación expuesta mediante un puerto; OIDC o un SaaS implicaría un nuevo adaptador ([D13](/es/adr/d13-users-and-authentication/)).
- Instrumentación OpenTelemetry detrás de un adaptador ([D15](/es/adr/d15-observability/)).
- MikroORM mapeado con `EntitySchema`, de modo que las entidades de dominio no dependen de él ([D6](/es/adr/d06-persistence/)).

## Servicios en ejecución

Todos los servicios se ejecutan con Docker Compose ([D8](/es/adr/d08-deployment/)).

| Servicio | Propósito | Decisión |
| --- | --- | --- |
| PostgreSQL + PostGIS | Persistencia y consultas espaciales | [D6](/es/adr/d06-persistence/) |
| Redis | Colas y planificación (BullMQ) | [D7](/es/adr/d07-queues-and-scheduling/) |
| OpenTelemetry Collector | Recolección de telemetría | [D15](/es/adr/d15-observability/) |
| Prometheus | Métricas | [D15](/es/adr/d15-observability/) |
| Loki | Logs | [D15](/es/adr/d15-observability/) |
| Tempo | Trazas | [D15](/es/adr/d15-observability/) |
| Grafana | Dashboards y alertas | [D15](/es/adr/d15-observability/) |

## Diagramas C4

Por definir.
