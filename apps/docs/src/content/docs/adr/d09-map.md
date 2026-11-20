---
title: "D9. Map"
description: "MapLibre GL (`react-map-gl`) behind an adapter, replaceable without affecting the rest."
sidebar:
  order: 10
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The map is a P1 user experience feature and its provider may need to change.

## Decision

MapLibre GL (`react-map-gl`) behind an adapter, replaceable without affecting the rest.

## Consequences

- The frontend defines a map port (markers, clustering, area selection, movement events) and MapLibre is its first implementation.
- UI components depend on the port, not on MapLibre or `react-map-gl`.
- Switching map provider (Leaflet, Google Maps, Mapbox) means writing a new adapter, without changing the domain or components.
- The same criterion applies to the rest of the external dependencies on both sides.

Consequences are shared with [D10](/adr/d10-cross-cutting-architecture/).
