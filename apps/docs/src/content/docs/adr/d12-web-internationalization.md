---
title: "D12. Web internationalization"
description: "`apps/web` is prepared for i18n from the start; the first release only includes Spanish. Galician, Catalan, and other languages will be adde"
sidebar:
  order: 13
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The web application should support more languages over time, although the first release only needs Spanish.

## Decision

`apps/web` is prepared for i18n from the start; the first release only includes Spanish. Galician, Catalan, and other languages will be added as translations.

## Consequences

- No interface text is written directly in components: everything goes through translation keys.
- Date, number, price, and area formats depend on the locale.
- The i18n library is accessed through an adapter ([D10](/adr/d10-cross-cutting-architecture/)).
- The "Multi-language" feature in section 13 now only means adding translations; the infrastructure already exists.
