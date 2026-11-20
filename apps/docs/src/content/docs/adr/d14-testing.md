---
title: "D14. Testing"
description: "Strict TDD (red, green, refactor). Vitest (unit), Testing Library (components), Testcontainers with real Postgres + PostGIS and Redis (integ"
sidebar:
  order: 15
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Product quality is expected from the start ([D0](/adr/d00-project-purpose/)).

## Decision

Strict TDD (red, green, refactor). Vitest (unit), Testing Library (components), Testcontainers with real Postgres + PostGIS and Redis (integration), and Playwright (E2E for critical flows).

## Consequences

- No production code is written without a previously failing test.
- Spatial queries and MikroORM custom types are tested against a real PostGIS, never against mocks or SQLite.
- E2E tests are limited to the acceptance criteria in section 15.
- Vitest in NestJS requires SWC compilation (decorators and metadata).
