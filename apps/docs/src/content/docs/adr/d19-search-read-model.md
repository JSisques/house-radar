---
title: "D19. Search read model"
description: "Search results are properties, not listings. The representative price is the lowest price among the property's active listings."
sidebar:
  order: 20
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

One property can have several listings with different prices on different sources ([D3](/adr/d03-source-strategy/)). Search, the map, and the dashboard must decide what a result is and which price it shows.

## Decision

Search results are properties, not listings. The representative price of a property is the lowest price among its active listings. Results are presented as "N listings, from X €", and the property page lists every listing with its own source and price.

## Consequences

- A property that appears on several portals is returned once, so result counts and statistics are not inflated by duplicates.
- Price filters, price sorting, and price per square meter use the representative price ([D20](/adr/d20-listing-consolidation-rules/)).
- A property with no active listing has no representative price; it is excluded from price-based filters and statistics.
- The read model is derived data. It must stay consistent when a listing is added, changes price, disappears, or is linked to another property ([D21](/adr/d21-duplicate-detection-policy/)).

## Alternatives considered

- **Listings as results:** each advertisement is a result. Discarded because it multiplies the same home in the results and statistics and contradicts the distinction between property and listing (product principle 2).
