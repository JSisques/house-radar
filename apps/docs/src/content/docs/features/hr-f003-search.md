---
title: "HR-F003: Search and advanced filters"
description: "The search is one of the central modules of the product."
sidebar:
  order: 3
---

## Summary

Search is one of the central modules of the product. Results are properties, not listings, and each result shows the representative price as "N listings, from X €" ([D19](/adr/d19-search-read-model/)). Users combine economic, area, feature, and geographic filters and sort the results.

## Priority

P0 (source section 3).

## Responsible modules

- `apps/api`, bounded context `properties`: search read model, filter and sort queries, spatial queries against PostGIS.
- `apps/web`: search screen, filter panel, results list, and pagination.
- `packages/domain`: filter and sort definitions shared by API and web.

## Dependencies

- [HR-F002](/features/hr-f002-normalization/): fields, location, and price per square meter.
- [HR-F005](/features/hr-f005-duplicates/): linked listings determine how many listings a property has.
- [HR-F006](/features/hr-f006-map/): map-area selection and synchronization with results.
- [HR-F007](/features/hr-f007-favorites-saved-searches/): saved searches store a set of filters.
- ADRs: [D6](/adr/d06-persistence/), [D12](/adr/d12-web-internationalization/), [D14](/adr/d14-testing/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want to filter properties by price, area, features, and location, so that I only see homes that fit what I look for.
- As a user, I want to see how many listings a property has and the lowest price, so that I can find the best offer without reading duplicates.
- As a user, I want to sort results and keep my filters when I open a property and come back, so that I do not lose my place.

## Business rules

- **HR-F003-BR1:** search results are properties, not listings. Each result shows its representative price, the lowest price among its active listings, as "N listings, from X €" ([D19](/adr/d19-search-read-model/)).
- **HR-F003-BR2:** only properties with at least one active listing appear in search results; a property with no active listing has no representative price.
- **HR-F003-BR3:** economic filters are minimum price, maximum price, and minimum and maximum price per square meter. Price filters apply to the representative price.
- **HR-F003-BR4:** price per square meter uses the built area only. Properties whose built area is unknown are excluded when a price-per-square-meter filter is active, and they are never matched through the usable area ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F003-BR5:** area filters are minimum and maximum built area, usable area, and plot area. A property whose value for a filtered area is unknown does not match that filter.
- **HR-F003-BR6:** feature filters are property type, number of bedrooms, number of bathrooms, condition, properties to renovate, detached houses, houses with land, properties with garage, and properties with garden. Unknown is never treated as "no": a property with an unknown garage does not match "with garage".
- **HR-F003-BR7:** geographic filters are autonomous community, province, municipality, postal code, radius from a location, and area selected on the map. Autonomous community, province, and municipality are the values derived from the pin ([D18](/adr/d18-location-pin-declared-precision/)); the postal code is the one entered by hand.
- **HR-F003-BR8:** radius and map-area filters use the property pin and are executed as spatial queries in PostGIS ([D6](/adr/d06-persistence/)). Properties without a pin do not match them.
- **HR-F003-BR9:** all active filters combine with AND.
- **HR-F003-BR10:** results can be sorted by price ascending, price descending, price per square meter, built area, plot area, date added, and update date. Properties with an unknown sort value are placed last, whichever direction is chosen.
- **HR-F003-BR11:** the screen shows the number of results, offers an action that clears all filters, and loads results progressively or in pages.
- **HR-F003-BR12:** active filters and sort order are kept when the user opens a property page and returns to the results.
- **HR-F003-BR13:** all labels, number formats, and currency formats are Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).

## Acceptance criteria

- **HR-F003-AC1:** Given one property with two active listings priced 200 000 € and 190 000 €, When the user searches, Then the property appears once, showing "2 listings, from 190 000 €".
- **HR-F003-AC2:** Given properties priced 150 000 €, 200 000 €, and 250 000 €, When the user sets minimum price 200 000 € and maximum price 250 000 €, Then only the second and third properties are returned.
- **HR-F003-AC3:** Given a property with usable area but no built area, When the user filters by price per square meter, Then the property is not returned.
- **HR-F003-AC4:** Given a property whose only listing has disappeared, When the user searches without filters, Then the property is not returned.
- **HR-F003-AC5:** Given a property with unknown garage, When the user filters by "with garage", Then the property is not returned.
- **HR-F003-AC6:** Given several active filters, When the user searches, Then only properties that satisfy every filter are returned.
- **HR-F003-AC7:** Given a location and a radius of 10 km, When the user applies the radius filter, Then only properties whose pin is within 10 km are returned and properties without a pin are not.
- **HR-F003-AC8:** Given a polygon drawn on the map, When the user applies the area filter, Then only properties whose pin is inside the polygon are returned.
- **HR-F003-AC9:** Given results sorted by price ascending, When some properties have an unknown sort value, Then they appear after all properties with a known value.
- **HR-F003-AC10:** Given active filters, When the user opens a property and returns to the search, Then the same filters, sort order, and results are shown.
- **HR-F003-AC11:** Given active filters, When the user clears all filters, Then no filter is applied and the result count updates.
- **HR-F003-AC12:** Given more results than fit in one page, When the user reaches the end of the loaded results, Then the next results are loaded without repeating or skipping any.
- **HR-F003-AC13:** Given a search with no matches, When the results are shown, Then the count is zero and the screen offers to clear the filters.

## Edge cases

- Minimum greater than maximum in a range filter: the input is rejected with a message and no query is run.
- A pin with precision `municipality` matches municipality-level filters but is not treated as a precise point by radius and map-area filters.
- A property changes (a listing disappears or its price changes) while the user is browsing: the next query reflects the new state; the page does not reorder silently while it is displayed.
- Radius search without a chosen location is not available.
- The same property appears once even if several of its listings match the filters differently; matching uses property-level consolidated values.

## Out of scope (MVP)

- Free-text search over titles and descriptions.
- AI-powered search ([out of scope](/product/out-of-scope/)).
- Searching individual listings: results are always properties ([D19](/adr/d19-search-read-model/)).

## Open questions

- How do "properties to renovate", "detached houses", and "houses with land" map to the model: values of condition and property type, or derived from plot area?
- What is the page size or loading increment for results?
- Should the user be able to include properties with no active listing in search results?

## Related decisions

[D6](/adr/d06-persistence/), [D12](/adr/d12-web-internationalization/), [D14](/adr/d14-testing/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).
