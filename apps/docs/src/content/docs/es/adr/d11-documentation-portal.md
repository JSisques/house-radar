---
title: "D11. Portal de documentación"
description: "Astro + Starlight en `apps/docs`, bilingüe (español e inglés) con i18n. El inglés es la fuente de verdad (locale por defecto); el español es"
sidebar:
  order: 12
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Cada decisión se documenta como ADR en un portal de documentación, que inicialmente era un repositorio independiente provisional.

## Decisión

Astro + Starlight en `apps/docs`, bilingüe (español e inglés) con i18n. El inglés es la fuente de verdad (locale por defecto); el español es una traducción.

## Consecuencias

- Starlight aporta navegación, búsqueda (Pagefind), i18n, modo oscuro y MDX.
- Estructura de contenidos en `apps/docs/src/content/docs/`: `product/` (visión, principios, alcance del MVP, fuera de alcance), `features/` (HR-F001…, una página por funcionalidad con criterios de aceptación), `architecture/` (visión general, bounded contexts, monorepo, diagramas C4), `adr/` (plantilla y un ADR por decisión), `domain/` (lenguaje ubicuo, modelo de datos), `sources/` (estrategia de fuentes, idealista, importación manual), `operations/` (despliegue, runbooks de ingestion, observabilidad).
