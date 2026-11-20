---
title: "D20. Listing consolidation rules"
description: "Rules for consolidating listings into a property: conflicts, price history, observations, disappearance, price per square meter, and statistics."
sidebar:
  order: 21
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

A property aggregates the data of one or more listings ([D19](/adr/d19-search-read-model/)). Without explicit rules, the same property could show contradictory values, misleading price history, or unreliable statistics.

## Decision

1. **Conflicting attributes:** when listings disagree on an attribute, the property shows the most recent observed value and flags the conflict, showing each value with its source.
2. **Price history:** it is stored per listing. The property shows the evolution of its lowest active price.
3. **Manual check:** the "check listing" action records a new observation: price (changed or not), still-active status, and check date.
4. **Disappeared listings:** for manual sources, the user marks the listing as disappeared. For automatic sources, a listing is disappeared when it has not been seen in N consecutive runs; N is configurable and defaults to 3.
5. **Price per square meter:** it uses the built area only. If the built area is missing, the value is unknown and never silently falls back to the usable area.
6. **Statistics:** they are computed over active properties and always state the sample size and provenance.

## Consequences

- Every change to a listing is an observation with a date and a source, which is what gives the history its meaning (product principle 3).
- The property never hides a disagreement between sources; the conflict is data the user can inspect.
- The history only reflects what House Radar has observed, never a complete past.
- The disappearance threshold N is configuration, not code.
- Properties without built area are excluded from price-per-square-meter statistics and filters, and the exclusion is visible in the sample size.

## Alternatives considered

- **Property with a single "winning" source:** discarded because it hides conflicts and makes the result depend on an arbitrary source priority.
- **Falling back to the usable area for price per square meter:** discarded because it mixes two different measures and would silently distort comparisons.
