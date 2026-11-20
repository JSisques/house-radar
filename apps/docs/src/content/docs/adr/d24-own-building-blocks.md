---
title: "D24. Own building blocks"
description: "The backend and frontend share two framework-free packages, building-blocks and shared-kernel, instead of depending on an external DDD kit."
sidebar:
  order: 25
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

DDD in `apps/api`, `apps/ingestion` ([D4](/adr/d04-backend-framework/)) and `apps/web` ([D5](/adr/d05-frontend-framework/)) needs shared base classes: aggregates, value objects, domain events, builders, criteria and repository ports. The author already has a kit (`@sisques-labs/nestjs-kit`) with these pieces, but its design conflicts with decisions of this project:

- Its aggregate base extends the `AggregateRoot` of `@nestjs/cqrs`, which puts a framework in the domain and violates [D4](/adr/d04-backend-framework/) and [D10](/adr/d10-cross-cutting-architecture/).
- It is coupled to TypeORM, while persistence uses MikroORM ([D6](/adr/d06-persistence/)).
- It compiles without strict mode.
- It forces `findByCriteria` on write repositories.

`apps/web` also needs value objects, so the code must run in the browser.

## Decision

Two own packages, both framework-free TypeScript in strict mode.

- `@house-radar/building-blocks`: generic DDD building blocks with no House Radar concepts. The aggregate keeps its own event buffer (`record()`, `peekDomainEvents()`, `clearDomainEvents()`) and infrastructure publishes to the Nest `EventBus`. It keeps the kit's value object base with mandatory `validate()`, event envelope, builder base, `Criteria` and separate read and write repository ports.
- `@house-radar/shared-kernel`: House Radar concepts used by two or more contexts (`Money`, `Area`, `GeoPoint`, closed catalogs, provenance and cross-context identities). It depends on `building-blocks`.

Details are in [Code conventions](/architecture/conventions/).

## Consequences

- The domain stays free of NestJS and TypeORM; `apps/web` can reuse the same value objects.
- We own and maintain the base code, including its tests ([D14](/adr/d14-testing/)).
- Good ideas from the kit are ported, with fixes: typed null-safe equality, immutable `Criteria`, invalid dates rejected, `DomainException` with `code` and `cause`, no `any` in filters.
- A value object starts in its context and moves to `shared-kernel` only when a second context needs it.
- Fixes in the kit do not flow automatically to this project.
- Superseded in part by [D31](/adr/d31-transactional-outbox/) and [D32](/adr/d32-uuid-v7/): events are no longer published to the `EventBus` by infrastructure after saving but persisted to an outbox, and UUIDs are v7 generated with the `uuid` package instead of `randomUUID()`.

## Alternatives considered

- **Depend on `@sisques-labs/nestjs-kit` as is:** least code to write. Discarded because of the framework coupling in the domain, the TypeORM dependency and the non-strict compilation.
- **Hybrid (use the kit for some pieces, own code for the rest):** discarded because two sources of base classes blur the boundaries and the problematic pieces (aggregate, repositories) are the core ones.
