---
title: "HR-F006: Real estate map"
description: "Interactive map for viewing and exploring properties."
sidebar:
  order: 6
---

- **Priority:** P1
- **Source section:** 6
- **Responsible module:** To be defined

Interactive map for viewing and exploring properties.

## Requirements

- [ ] Display of properties on a map.
- [ ] Markers with prices.
- [ ] Open the property page from the marker.
- [ ] Synchronization between map and results.
- [ ] Filter by geographic area.
- [ ] Geolocation of properties.
- [ ] Marker clustering when there are many properties.
- [ ] Approximate display when exact coordinates are not available.

## Notes

- The frontend defines a map port (markers, clustering, area selection, movement events); MapLibre GL is its first implementation ([D9](/adr/d09-map/), [D10](/adr/d10-cross-cutting-architecture/)).
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
