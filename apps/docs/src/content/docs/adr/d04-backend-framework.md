---
title: "D4. Backend framework"
description: "NestJS with DDD for `apps/api` and `apps/ingestion`. Code conventions will be defined later in the repository."
sidebar:
  order: 5
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The backend applications `apps/api` and `apps/ingestion` need a framework and an architectural style.

## Decision

NestJS with DDD for `apps/api` and `apps/ingestion`. Code conventions will be defined later in the repository.

## Consequences

- Organization by bounded contexts (for example: listings, properties, pricing-history, ingestion, users).
- Domain, application, and infrastructure layers per context.
- The domain does not depend on NestJS: decorators, modules, and dependency injection are limited to the application and infrastructure layers.
- Code conventions are still to be defined in the monorepo.
