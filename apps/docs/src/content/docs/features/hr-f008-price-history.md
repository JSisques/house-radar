---
title: "HR-F008: Price history and tracking"
description: "The history is one of the elements that can differentiate House Radar from a traditional real estate search engine."
sidebar:
  order: 8
---

- **Priority:** P0
- **Source section:** 8
- **Responsible module:** To be defined

The history is one of the elements that can differentiate House Radar from a traditional real estate search engine.

## Requirements

- [ ] Store listing snapshots.
- [ ] Record price changes.
- [ ] Record relevant feature changes.
- [ ] Detect disappeared listings.
- [ ] Query the initial known price.
- [ ] Query the current price.
- [ ] Calculate absolute variation.
- [ ] Calculate percentage variation.
- [ ] Show the evolution in a chart.

## Notes

- The history must reflect what House Radar has observed since it started collecting a listing. It must not be presented as a complete history prior to the first observation.
- Storing snapshots and an own history depends on the terms of each source ([D3](/adr/d03-source-strategy/)).
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
