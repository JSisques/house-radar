---
title: "D5. Frontend framework"
description: "React + Vite (SPA) for `apps/web`. SSR of property pages is postponed until a possible publication."
sidebar:
  order: 6
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The web application `apps/web` needs a rendering approach and framework.

## Decision

React + Vite (SPA) for `apps/web`. SSR of property pages is postponed until a possible publication.

## Consequences

- The web app is deployed as static files and consumes the NestJS API directly.
- Components are organized with atomic design and the container-presentational pattern.
- If the product is published and SEO for property pages becomes relevant, SSR for those pages will be evaluated.

## Alternatives considered

- SSR of property pages: postponed until a possible publication.
