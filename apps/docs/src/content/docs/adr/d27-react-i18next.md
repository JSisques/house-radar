---
title: "D27. react-i18next"
description: "apps/web uses react-i18next behind the i18n adapter, with typed keys, one namespace per context and Intl for formatting."
sidebar:
  order: 28
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

[D12](/adr/d12-web-internationalization/) requires `apps/web` to be ready for i18n from the start, with Spanish first and Galician and Catalan later, and the library to sit behind an adapter ([D10](/adr/d10-cross-cutting-architecture/)). That decision left the library open.

## Decision

Use `react-i18next` behind the i18n adapter.

- One namespace per context, read with `useTranslation`.
- Keys typed through a TypeScript resource declaration, so a misspelled key does not compile.
- Lazy loading per locale, and a test that verifies locale parity.
- Prices, areas and dates are formatted with the native `Intl` API (`Intl.NumberFormat` with `currency: 'EUR'`, `Intl.DateTimeFormat`) inside the adapter.

Details are in [Code conventions](/architecture/conventions/).

## Consequences

- Adding a language means adding translation files only.
- Typed keys catch missing or misspelled keys at compile time.
- Formatting does not depend on the translation library.
- Components depend on the adapter, so the library remains replaceable.

## Alternatives considered

- **FormatJS (`react-intl`):** ICU message syntax and built-in formatting. Discarded because formatting is covered by `Intl`, and the resulting setup is heavier for the same need.
- **Lingui:** compile-time extraction and small bundles. Discarded because its macro and extraction tooling add build complexity that this project does not need.
