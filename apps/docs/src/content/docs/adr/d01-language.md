---
title: "D1. Language"
description: "TypeScript end to end (API, web, ingestion). Python for ingestion remains an option in V2 if justified."
sidebar:
  order: 2
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The platform comprises an API, a web application, and ingestion workers, and needs a language choice for all of them.

## Decision

TypeScript end to end (API, web, ingestion). Python for ingestion remains an option in V2 if justified.

## Consequences

- The normalized domain model is shared as an internal package (`packages/domain`), typed end to end.
- A change to the model is resolved in a single atomic PR.
- Boundaries between modules are enforced by the architecture (packages and explicit dependencies), not by splitting into repositories.
- Ingestion is an independent application: it could be rewritten in another language without affecting the rest, as long as its contract is respected.

Consequences are shared with [D2](/adr/d02-repository-strategy/).

## Alternatives considered

- Python for ingestion: kept as an option for V2 if justified.
