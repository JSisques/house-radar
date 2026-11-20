---
title: "D22. API style"
description: "The web communicates with the API over REST, described by an OpenAPI contract from which a typed TypeScript client is generated."
sidebar:
  order: 23
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

`apps/web` ([D5](/adr/d05-frontend-framework/)) needs to communicate with `apps/api` ([D4](/adr/d04-backend-framework/)). The main interactions are resource reads with many filters (search, map area, statistics), property and listing pages, and a small set of commands (manual import, check listing, favorites, saved searches). The whole stack is TypeScript ([D1](/adr/d01-language/)), and types must stay in sync across the boundary.

## Decision

The API is REST over HTTP, described by an OpenAPI contract.

- `apps/api` generates the OpenAPI document from its controllers and DTOs (`@nestjs/swagger`).
- `apps/web` generates a typed TypeScript client from that document (for example, with `openapi-typescript`).
- The HTTP client is accessed through a port in the frontend ([D10](/adr/d10-cross-cutting-architecture/)).

## Consequences

- Types stay consistent end to end: a contract change surfaces as a type error in `apps/web`.
- Search is modeled as a filtered resource (for example, `GET /properties?minPrice=…&bbox=…`), which fits filters reflected in the URL.
- GeoJSON from PostGIS ([D6](/adr/d06-persistence/)) is returned as-is to the map ([D9](/adr/d09-map/)).
- Standard HTTP caching and tooling apply.
- The OpenAPI document is published in the documentation portal ([D11](/adr/d11-documentation-portal/)).
- CI must verify that the generated client is up to date with the contract ([D16](/adr/d16-quality-and-workflow/)).

## Alternatives considered

- **GraphQL:** its strength is serving many different clients with different data shapes; the MVP has a single client (the SPA). Discarded because it adds N+1 handling (DataLoader), complicates caching, and turns GeoJSON into an opaque scalar. Because the HTTP client sits behind a port, a GraphQL adapter remains possible if a future need justifies it.
- **tRPC / ts-rest:** end-to-end types without code generation. Discarded because they couple the frontend tightly to the backend, fit poorly with NestJS controllers, and would not serve a future mobile application (V3).
