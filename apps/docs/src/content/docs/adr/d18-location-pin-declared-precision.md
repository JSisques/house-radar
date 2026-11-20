---
title: "D18. Location as a pin with declared precision"
description: "Location is a pin on a map with a declared precision; municipality and province are derived from official boundaries and geocoding is deferred."
sidebar:
  order: 19
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Search, the map, and statistics by municipality need a location for every property. Manually imported listings ([D17](/adr/d17-manual-import-assisted-form/)) have no coordinates, and many portals only publish approximate locations. Geocoding addresses requires an external service whose terms and cost have not been evaluated.

## Decision

The location of a property is a pin placed on a map with a declared precision: `exact`, `approximate`, or `municipality`. Municipality and province are derived from the pin through a PostGIS point-in-polygon query against the official open boundaries of the IGN (Instituto Geográfico Nacional). The postal code is entered by hand. Geocoding is deferred: when needed it will be a new adapter behind a port ([D10](/adr/d10-cross-cutting-architecture/)).

## Consequences

- Every property has at most one location, made of coordinates plus precision. A property without a pin has an unknown location.
- The administrative boundaries are loaded into PostGIS ([D6](/adr/d06-persistence/)) and are reference data, not user data.
- The map ([HR-F006](/features/hr-f006-map/)) shows the declared precision and never presents an approximate pin as exact.
- Autonomous community, province, and municipality filters rely on the derived values, so they are consistent regardless of the source.
- The postal code is declared data and is not validated against the pin.

## Alternatives considered

- **Geocoding the address:** discarded for the MVP because it depends on an external service with unknown terms and quotas, and it would not help manual listings whose address is partial.
- **Both (geocoding with a manual pin as fallback):** discarded for the MVP to keep a single location mechanism; it can be added later as an adapter without changing the model.
