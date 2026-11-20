---
title: "D14. Testing"
description: "TDD estricto (rojo, verde, refactor). Vitest (unitarios), Testing Library (componentes), Testcontainers con Postgres + PostGIS y Redis reale"
sidebar:
  order: 15
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Se espera calidad de producto desde el inicio ([D0](/es/adr/d00-project-purpose/)).

## Decisión

TDD estricto (rojo, verde, refactor). Vitest (unitarios), Testing Library (componentes), Testcontainers con Postgres + PostGIS y Redis reales (integración) y Playwright (E2E de flujos críticos).

## Consecuencias

- Ningún código de producción se escribe sin un test que falle previamente.
- Las consultas espaciales y los custom types de MikroORM se prueban contra PostGIS real, nunca contra mocks o SQLite.
- Los E2E se limitan a los criterios de aceptación de la sección 15.
- Vitest en NestJS requiere compilación con SWC (decoradores y metadatos).
