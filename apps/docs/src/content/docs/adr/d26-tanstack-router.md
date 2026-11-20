---
title: "D26. TanStack Router"
description: "apps/web uses TanStack Router, with search params typed and validated with zod in the route definition."
sidebar:
  order: 27
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

`apps/web` ([D5](/adr/d05-frontend-framework/)) is a SPA whose search state lives in the URL, with around twenty filters (HR-F003-BR11). The API is consumed through a typed client ([D22](/adr/d22-api-style/)) and server data is cached with TanStack Query. The router must type and validate the URL, because the URL is the search state.

## Decision

Use TanStack Router.

- Search params are declared in the route definition and validated with zod; invalid values fall back to defaults.
- Navigation is type-safe: a link to a nonexistent route or with wrong params is a compile error.
- Routes integrate with TanStack Query for loading data.

Details are in [Code conventions](/architecture/conventions/).

## Consequences

- Filters are typed from the URL to the use case, with defaults handled in one place.
- Broken links are caught at compile time.
- The router is a smaller community than React Router, and its file-based tooling adds a build step.
- The router sits in the presentation layer; use cases do not depend on it ([D10](/adr/d10-cross-cutting-architecture/)).

## Alternatives considered

- **React Router v7:** the most widespread choice and a familiar API. Discarded because search params are plain strings that we would type and validate by hand, and links are not checked at compile time.
