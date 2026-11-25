---
title: "D6. Persistencia"
description: "PostgreSQL + PostGIS con MikroORM (Data Mapper + Unit of Work)."
sidebar:
  order: 7
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

House Radar almacena anuncios normalizados y necesita consultas espaciales (radio, zona en mapa).

## Decisión

PostgreSQL + PostGIS con MikroORM (Data Mapper + Unit of Work).

## Consecuencias

- El mapeo se define con `EntitySchema` (sin decoradores), de modo que las entidades de dominio no dependen de MikroORM. [D38](/es/adr/d38-persistence-row-definition/) precisa cómo: las filas se declaran con `defineEntity` y su tipo se infiere.
- MikroORM no ofrece soporte nativo completo de PostGIS: los tipos geométricos se implementan como custom types (por ejemplo, `Point`) y las consultas espaciales (radio, zona en mapa) se escriben con QueryBuilder o SQL explícito encapsulado en los repositorios.
- Migraciones versionadas en el repositorio mediante el sistema de migraciones de MikroORM.
