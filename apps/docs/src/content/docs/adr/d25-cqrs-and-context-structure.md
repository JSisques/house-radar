---
title: "D25. CQRS and context structure"
description: "The backend uses CQRS with @nestjs/cqrs and a per-context layout with domain, application, infrastructure and transport layers."
sidebar:
  order: 26
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The backend is organized by bounded contexts ([D4](/adr/d04-backend-framework/)) with ports and adapters ([D10](/adr/d10-cross-cutting-architecture/)). We need a uniform way to express application behavior, a predictable folder layout, and a rule for how contexts talk to each other. Search is also served from a read model ([D19](/adr/d19-search-read-model/)), so reads and writes have different shapes.

## Decision

- Application behavior is expressed as commands and queries handled with `@nestjs/cqrs`. Each command or query has its own folder containing the message, its handler and its spec, for example `commands/import-manual-listing/` and `queries/property-find-by-id/`.
- Each context lives in `src/contexts/<context>/{domain,application,infrastructure,transport}`. `src/core/` holds app-wide infrastructure and `src/shared/` cross-context Nest pieces.
- Dependencies point inward. `transport` only uses `CommandBus` and `QueryBus`; handlers only use repositories and services.
- Contexts communicate through ports in `application/ports/`, implemented by adapters in `infrastructure/adapters/`, or through domain events consumed by event handlers and projections.
- Inbound code is REST only ([D22](/adr/d22-api-style/)).

Details are in [Code conventions](/architecture/conventions/).

## Consequences

- One file layout for every operation: a new use case is a new folder, and screaming architecture shows what the system does.
- Read and write paths can evolve separately, which fits the search read model.
- Domain events have first-class consumers instead of being a side effect.
- Dependency rules are checkable by ESLint ([D16](/adr/d16-quality-and-workflow/)).
- More files per feature than a single service class.
- The aggregate does not extend the framework's `AggregateRoot`, so command handlers publish the events it recorded ([D24](/adr/d24-own-building-blocks/)).

## Alternatives considered

- **Plain use cases with commands and queries folders, no bus:** same layout with handlers injected directly. Simpler, and `application` would not depend on `@nestjs/cqrs`. Discarded because the buses decouple transport from handlers and give a single place for cross-cutting behavior, at little extra complexity in the NestJS ecosystem.
