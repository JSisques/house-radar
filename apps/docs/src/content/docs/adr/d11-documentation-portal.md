---
title: "D11. Documentation portal"
description: "Astro + Starlight in `apps/docs`, bilingual (Spanish and English) with i18n. English is the source of truth (default locale); Spanish is a t"
sidebar:
  order: 12
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Each decision is documented as an ADR in a documentation portal, which was provisionally a separate repository.

## Decision

Astro + Starlight in `apps/docs`, bilingual (Spanish and English) with i18n. English is the source of truth (default locale); Spanish is a translation.

## Consequences

- Starlight provides navigation, search (Pagefind), i18n, dark mode, and MDX.
- Content structure under `apps/docs/src/content/docs/`: `product/` (vision, principles, MVP scope, out of scope), `features/` (HR-F001 onward, one page per feature with acceptance criteria), `architecture/` (overview, bounded contexts, monorepo, C4 diagrams), `adr/` (template and one ADR per decision), `domain/` (ubiquitous language, data model), `sources/` (source strategy, idealista, manual import), `operations/` (deployment, ingestion runbooks, observability).
