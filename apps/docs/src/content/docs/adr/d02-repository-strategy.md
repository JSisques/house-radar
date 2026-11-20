---
title: "D2. Repository strategy"
description: "A single `house-radar` monorepo (pnpm workspaces + Turborepo) containing code, infrastructure, and documentation."
sidebar:
  order: 3
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Code, infrastructure, and documentation needed a repository layout. A provisional `house-radar-docs` repository was initially created; it was discarded and the documentation now lives in `apps/docs` within the monorepo.

## Decision

A single `house-radar` monorepo (pnpm workspaces + Turborepo) containing code, infrastructure, and documentation.

## Consequences

- The normalized domain model is shared as an internal package (`packages/domain`), typed end to end.
- A change to the model is resolved in a single atomic PR.
- Boundaries between modules are enforced by the architecture (packages and explicit dependencies), not by splitting into repositories.
- Ingestion is an independent application: it could be rewritten in another language without affecting the rest, as long as its contract is respected.

Consequences are shared with [D1](/adr/d01-language/).
