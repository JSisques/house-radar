---
title: "HR-F003: Search and advanced filters"
description: "The search is one of the central modules of the product."
sidebar:
  order: 3
---

- **Priority:** P0
- **Source section:** 3
- **Responsible module:** To be defined

The search is one of the central modules of the product.

## Requirements

### Economic filters

- [ ] Minimum price.
- [ ] Maximum price.
- [ ] Minimum and maximum price per square meter.

### Area filters

- [ ] Minimum and maximum built area.
- [ ] Minimum and maximum usable area.
- [ ] Minimum and maximum plot area.

### Feature filters

- [ ] Property type.
- [ ] Number of bedrooms.
- [ ] Number of bathrooms.
- [ ] Condition.
- [ ] Properties to renovate.
- [ ] Detached houses.
- [ ] Houses with land.
- [ ] Properties with garage.
- [ ] Properties with garden.

### Geographic filters

- [ ] Autonomous community.
- [ ] Province.
- [ ] Municipality.
- [ ] Postal code.
- [ ] Radius from a location.
- [ ] Area selection on the map.

### Sorting

- [ ] Price ascending.
- [ ] Price descending.
- [ ] Price per square meter.
- [ ] Area.
- [ ] Plot area.
- [ ] Date added.
- [ ] Update date.

### Search behavior

- [ ] Combine several filters simultaneously.
- [ ] Clear all filters.
- [ ] Show the number of results.
- [ ] Keep filters when navigating between results and property pages, when possible.
- [ ] Pagination or progressive loading of results.

## Notes

- Radius and map-area filters are spatial queries; they are tested against a real PostGIS ([D6](/adr/d06-persistence/), [D14](/adr/d14-testing/)).
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
