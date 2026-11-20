---
title: "D10. Cross-cutting architecture"
description: "DDD with ports and adapters in both backend and frontend. Every external library (ORM, queues, map, charts, HTTP) is accessed through an ada"
sidebar:
  order: 11
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Backend and frontend both depend on external libraries that may need to be replaced.

## Decision

DDD with ports and adapters in both backend and frontend. Every external library (ORM, queues, map, charts, HTTP) is accessed through an adapter.

## Consequences

- The frontend defines a map port (markers, clustering, area selection, movement events) and MapLibre is its first implementation.
- UI components depend on the port, not on MapLibre or `react-map-gl`.
- Switching map provider (Leaflet, Google Maps, Mapbox) means writing a new adapter, without changing the domain or components.
- The same criterion applies to the rest of the external dependencies on both sides.

Consequences are shared with [D9](/adr/d09-map/).
