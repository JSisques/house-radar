---
title: "D6. Persistence"
description: "PostgreSQL + PostGIS with MikroORM (Data Mapper + Unit of Work)."
sidebar:
  order: 7
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

House Radar stores normalized listings and needs spatial queries (radius, map area).

## Decision

PostgreSQL + PostGIS with MikroORM (Data Mapper + Unit of Work).

## Consequences

- Mapping is defined with `EntitySchema` (no decorators), so domain entities do not depend on MikroORM. [D38](/adr/d38-persistence-row-definition/) refines how: rows are declared with `defineEntity` and their type is inferred.
- MikroORM does not fully support PostGIS natively: geometric types are implemented as custom types (for example, `Point`), and spatial queries (radius, map area) are written with QueryBuilder or explicit SQL encapsulated in repositories.
- Versioned migrations in the repository using the MikroORM migration system.
