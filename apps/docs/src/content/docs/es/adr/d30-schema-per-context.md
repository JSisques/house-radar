---
title: "D30. Un esquema de PostgreSQL por contexto"
description: "Cada bounded context posee un esquema de PostgreSQL; no hay claves foráneas entre esquemas y las lecturas entre contextos pasan por proyecciones."
sidebar:
  order: 31
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La persistencia es PostgreSQL + PostGIS con MikroORM ([D6](/es/adr/d06-persistence/)), accedida mediante adaptadores ([D10](/es/adr/d10-cross-cutting-architecture/)). Los contextos definidos en [D28](/es/adr/d28-bounded-context-map/) no deben acoplarse a través de la base de datos, aunque compartan servidor.

## Decisión

- Un esquema de PostgreSQL por bounded context: `ingestion`, `listings`, `properties`, `geography`, `identity`, `users`.
- Sin claves foráneas entre esquemas: los contextos se referencian por ID. Dentro de un esquema las claves foráneas están permitidas.
- Cada contexto posee sus migraciones y sus permisos.
- Las lecturas entre contextos pasan por proyecciones ([D29](/es/adr/d29-aggregate-boundaries/)), nunca por `JOIN` entre esquemas.
- Valores por defecto: dinero como `bigint` en céntimos; ubicaciones como `geography(Point, 4326)` (radio en metros con `ST_DWithin`); límites municipales como `geometry(MultiPolygon, 4326)`; valores desconocidos como `NULL` más una columna de origen (`declared`, `calculated`, `inferred`) donde el origen importe ([D20](/es/adr/d20-listing-consolidation-rules/)).

Las tablas se describen en [Esquema de base de datos](/es/architecture/database-schema/).

## Consecuencias

- Los límites de la base de datos reflejan los de los contextos, y un contexto podrá pasar a su propia base de datos sin cambiar su modelo.
- Los permisos pueden concederse por esquema.
- La base de datos no garantiza la integridad referencial entre contextos: los handlers y puertos deben verificarla (por ejemplo `AssertPropertyExists`) y las referencias huérfanas deben tolerarse o limpiarse mediante eventos.
- Leer datos de dos contextos requiere una proyección o una composición en la capa de aplicación.
- Las migraciones son por contexto, por lo que las herramientas deben ejecutar varios flujos de migración.

## Alternativas consideradas

- **Un único esquema `public` con prefijos en las tablas:** herramientas más simples, pero nada impide los joins y claves foráneas entre contextos y los límites se erosionan en silencio. Descartada.
