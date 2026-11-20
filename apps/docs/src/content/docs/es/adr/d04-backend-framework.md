---
title: "D4. Framework backend"
description: "NestJS con DDD para `apps/api` y `apps/ingestion`. Las convenciones de código se definirán más adelante en el repositorio."
sidebar:
  order: 5
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Las aplicaciones backend `apps/api` y `apps/ingestion` necesitan un framework y un estilo arquitectónico.

## Decisión

NestJS con DDD para `apps/api` y `apps/ingestion`. Las convenciones de código se definirán más adelante en el repositorio.

## Consecuencias

- Organización por bounded contexts (por ejemplo: listings, properties, pricing-history, ingestion, users).
- Capas de dominio, aplicación e infraestructura por contexto.
- El dominio no depende de NestJS: decoradores, módulos e inyección de dependencias se limitan a las capas de aplicación e infraestructura.
- Convenciones de código pendientes de definir en el monorepo.
