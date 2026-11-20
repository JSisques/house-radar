---
title: "Registros de decisiones de arquitectura"
description: "Índice de todas las decisiones de arquitectura D0 a D16."
sidebar:
  order: 0
---

Decisiones de producto y técnicas tomadas antes de empezar el desarrollo. Cada decisión del registro se documenta como un ADR cuyo identificador coincide con el del registro (D0 a D16). La numeración de los ADR es el número de la decisión. Usa la [plantilla](/es/adr/template/) para nuevas decisiones.

| ID | Decisión | Resultado | Fecha |
| --- | --- | --- | --- |
| D0 | [Propósito del proyecto](/es/adr/d00-project-purpose/) | Herramienta personal construida con estándares de producto real; sirve como portfolio y puede evolucionar a producto público. | 2026-11-20 |
| D1 | [Lenguaje](/es/adr/d01-language/) | TypeScript de punta a punta (API, web, ingestion). Python para ingestion queda como opción en V2 si se justifica. | 2026-11-20 |
| D2 | [Estrategia de repositorios](/es/adr/d02-repository-strategy/) | Monorepo único `house-radar` (pnpm workspaces + Turborepo) que incluye código, infraestructura y documentación. | 2026-11-20 |
| D3 | [Estrategia de fuentes](/es/adr/d03-source-strategy/) | Primera fuente objetivo: idealista Search API (oficial, acceso bajo solicitud). Fuente provisional del MVP: importación manual por URL. Segunda fuente candidata: feeds autorizados de inmobiliarias locales de Santiago. | 2026-11-20 |
| D4 | [Framework backend](/es/adr/d04-backend-framework/) | NestJS con DDD para `apps/api` y `apps/ingestion`. Las convenciones de código se definirán más adelante en el repositorio. | 2026-11-20 |
| D5 | [Framework frontend](/es/adr/d05-frontend-framework/) | React + Vite (SPA) para `apps/web`. SSR de fichas pospuesto hasta una posible publicación. | 2026-11-20 |
| D6 | [Persistencia](/es/adr/d06-persistence/) | PostgreSQL + PostGIS con MikroORM (Data Mapper + Unit of Work). | 2026-11-20 |
| D7 | [Colas y planificación](/es/adr/d07-queues-and-scheduling/) | BullMQ + Redis (`@nestjs/bullmq`) para la ejecución de la ingestion. | 2026-11-20 |
| D8 | [Despliegue](/es/adr/d08-deployment/) | Servidor propio con Docker Compose. Despliegue agnóstico de la plataforma: el mismo Compose debe poder moverse a un VPS sin cambios. | 2026-11-20 |
| D9 | [Mapa](/es/adr/d09-map/) | MapLibre GL (`react-map-gl`) detrás de un adaptador, sustituible sin afectar al resto. | 2026-11-20 |
| D10 | [Arquitectura transversal](/es/adr/d10-cross-cutting-architecture/) | DDD con puertos y adaptadores tanto en backend como en frontend. Toda librería externa (ORM, colas, mapa, gráficas, HTTP) se accede mediante un adaptador. | 2026-11-20 |
| D11 | [Portal de documentación](/es/adr/d11-documentation-portal/) | Astro + Starlight en `apps/docs`, bilingüe (español e inglés) con i18n. El inglés es la fuente de verdad (locale por defecto); el español es una traducción. | 2026-11-20 |
| D12 | [Internacionalización web](/es/adr/d12-web-internationalization/) | `apps/web` preparado para i18n desde el inicio; la primera release solo incluye español. Gallego, catalán y otros idiomas se añadirán como traducciones. | 2026-11-20 |
| D13 | [Usuarios y autenticación](/es/adr/d13-users-and-authentication/) | Autenticación propia en NestJS (bounded context `identity`), registro deshabilitado y una única cuenta creada mediante seed. | 2026-11-20 |
| D14 | [Testing](/es/adr/d14-testing/) | TDD estricto (rojo, verde, refactor). Vitest (unitarios), Testing Library (componentes), Testcontainers con Postgres + PostGIS y Redis reales (integración) y Playwright (E2E de flujos críticos). | 2026-11-20 |
| D15 | [Observabilidad](/es/adr/d15-observability/) | Stack completo desde el MVP: OpenTelemetry (Collector) → Prometheus (métricas), Loki (logs), Tempo (trazas) y Grafana (dashboards y alertas). Logs estructurados con Pino, health checks con `@nestjs/terminus` y Bull Board para jobs. | 2026-11-20 |
| D16 | [Calidad y flujo de trabajo](/es/adr/d16-quality-and-workflow/) | GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites arquitectónicos verificados en CI, Conventional Commits con commitlint, ramas de feature cortas con PR a `main` y versiones de Node y pnpm fijadas en el repositorio. | 2026-11-20 |
