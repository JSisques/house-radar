---
title: "HR-F006: Real estate map"
description: "Interactive map for viewing and exploring properties."
sidebar:
  order: 6
---

## Summary

An interactive map to view and explore properties. Each property appears as a price marker at its pin, with its declared precision made visible. The map shows the same result set as the search and is also the tool to place a property pin. The frontend accesses the map only through a port; MapLibre GL is its first adapter ([D9](/adr/d09-map/)).

## Priority

P1 (source section 6).

## Responsible modules

- `apps/web`: map screen, map port (markers, clustering, area selection, movement events), MapLibre GL adapter, and the pin picker used by the manual import form.
- `apps/api`, bounded context `properties`: spatial queries for the results shown on the map.
- `packages/shared-kernel`: location and precision definitions.

## Dependencies

- [HR-F002](/features/hr-f002-normalization/): location with declared precision.
- [HR-F003](/features/hr-f003-search/): filters that define the result set, and the area filter set from the map.
- [HR-F004](/features/hr-f004-property-detail/): destination when opening a marker.
- [HR-F001](/features/hr-f001-ingestion/): the manual import form uses the pin picker.
- ADRs: [D6](/adr/d06-persistence/), [D9](/adr/d09-map/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/).

## User stories

- As a user, I want to see properties on a map with their prices, so that I understand where the offers are.
- As a user, I want to know how reliable each location is, so that I do not mistake an approximate position for the exact one.
- As a user, I want to draw an area on the map and see the properties inside it, so that I can search in the neighborhood I care about.
- As a user, I want to place a pin when I register a property by hand, so that its location is stored with its precision.

## Business rules

- **HR-F006-BR1:** the map shows properties, not listings. Each marker shows the representative price of its property ([D19](/adr/d19-search-read-model/)).
- **HR-F006-BR2:** the map and the results list show the same result set for the current filters ([HR-F003](/features/hr-f003-search/)). Selecting a result highlights its marker and selecting a marker highlights its result.
- **HR-F006-BR3:** opening a marker leads to the property detail page ([HR-F004](/features/hr-f004-property-detail/)).
- **HR-F006-BR4:** the geographic area filter can be set by selecting an area on the map; the selection is the polygon filter of [HR-F003](/features/hr-f003-search/).
- **HR-F006-BR5:** the location of a property is its pin with declared precision `exact`, `approximate`, or `municipality` ([D18](/adr/d18-location-pin-declared-precision/)). Markers with `approximate` or `municipality` precision are visually distinct from `exact` ones and say so, and an approximate position is never presented as exact.
- **HR-F006-BR6:** properties without a pin are not shown on the map; the screen states how many results are not shown for that reason.
- **HR-F006-BR7:** when there are many properties, nearby markers are grouped into clusters that show their number and expand when zoomed in or selected.
- **HR-F006-BR8:** the pin picker places or moves a pin and requires choosing a precision. Saving a pin derives municipality and province ([D18](/adr/d18-location-pin-declared-precision/)).
- **HR-F006-BR9:** the map library is accessed only through the map port, so it can be replaced without touching the rest of the frontend ([D9](/adr/d09-map/), [D10](/adr/d10-cross-cutting-architecture/)).
- **HR-F006-BR10:** map text, price formats, and controls are Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).
- **HR-F006-BR11:** panning or zooming the map does not filter the results. Only the explicit "search this area" button restricts the results to the visible area.
- **HR-F006-BR12:** map tiles come from OpenFreeMap (free, no API key, no registration; provided as-is and may change or be discontinued). They are consumed through the map tiles adapter ([D9](/adr/d09-map/), [D10](/adr/d10-cross-cutting-architecture/)) so the provider can be replaced or self-hosted. Sources: <https://openfreemap.org> and <https://openfreemap.org/tos/>.
- **HR-F006-BR13:** the OpenStreetMap attribution is always shown on the map.

## Acceptance criteria

- **HR-F006-AC1:** Given search results with a pin, When the user opens the map, Then each property appears once as a marker showing its representative price.
- **HR-F006-AC2:** Given a property with two active listings, When the map is shown, Then it has one marker, not two.
- **HR-F006-AC3:** Given a marker, When the user selects it, Then the property detail page opens.
- **HR-F006-AC4:** Given the list and the map showing the same filters, When the user selects a result in the list, Then its marker is highlighted, and vice versa.
- **HR-F006-AC5:** Given a property with precision `approximate`, When the map is shown, Then its marker is distinguishable from an `exact` one and indicates that the position is approximate.
- **HR-F006-AC6:** Given results without a pin, When the map is shown, Then they do not appear on it and the screen indicates how many are not shown.
- **HR-F006-AC7:** Given many nearby properties, When the map is zoomed out, Then they are grouped into clusters showing their count and zooming in separates them.
- **HR-F006-AC8:** Given an area selected on the map, When the user confirms it, Then the search shows only properties whose pin is inside the area.
- **HR-F006-AC9:** Given the manual import form, When the user places a pin and chooses a precision, Then the pin and precision are saved and municipality and province are derived.
- **HR-F006-AC10:** Given the user tries to save a pin without choosing a precision, When they submit, Then the pin is not saved and the form asks for the precision.
- **HR-F006-AC11:** Given a map adapter replaced by another implementation of the port, When the map screen is used, Then its behavior is unchanged.
- **HR-F006-AC12:** Given a map with results, When the user pans or zooms, Then the results list does not change.
- **HR-F006-AC13:** Given a panned or zoomed map, When the user selects "search this area", Then the results are restricted to the visible area.
- **HR-F006-AC14:** Given the map is displayed, When tiles are shown, Then the OpenStreetMap attribution is visible.

## Edge cases

- Several properties with the same pin (for example, one building): they cluster and cannot hide each other.
- A pin outside every known boundary: it is shown, and its municipality and province are unknown.
- The map tiles cannot be loaded: the result list still works and the screen indicates that the map is unavailable.
- Result sets with no pin at all: the map is shown empty with its explanation.
- A property that changes its pin: the marker moves on the next load.
- Area selection that covers no properties: zero results are shown, the area is kept.

## Out of scope (MVP)

- Geocoding of addresses ([D18](/adr/d18-location-pin-declared-precision/)).
- Street-level routes, points of interest, and neighborhood data.
- Drawing multiple areas at once.

## Related decisions

[D6](/adr/d06-persistence/), [D9](/adr/d09-map/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/).
