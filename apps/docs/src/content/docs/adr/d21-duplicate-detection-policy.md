---
title: "D21. Duplicate detection policy"
description: "The system suggests duplicate candidates and never merges automatically; the user resolves each one. Thresholds are configurable."
sidebar:
  order: 22
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The same home can be advertised on several sources, and House Radar must distinguish the real property from its listings (product principle 2). Merging two different homes by mistake corrupts history and statistics and is hard to undo.

## Decision

The system suggests duplicate candidates and never merges automatically. A pair of listings is a candidate when all of the following hold:

- their locations are close: the distance between them is under 100 m when both locations have `exact` precision; when the precision of either location is not `exact`, the 100 m criterion is replaced by "same municipality";
- their built areas differ by at most 5 %; and
- they have the same number of bedrooms.

The same source and the same external identifier is not a duplicate candidate: it is the same listing, and ingestion updates it (idempotent ingestion).

The thresholds (100 m, 5 %) are configurable. The user resolves each candidate as "same property" (the listings are linked to one property) or "different property" (the candidate is dismissed and the decision is remembered, so the pair is not suggested again).

## Consequences

- Candidate detection is a suggestion mechanism; every link between listings comes from an explicit user action.
- Dismissed pairs are persisted, so detection is idempotent and does not nag.
- Listings without location, built area, or bedrooms cannot be candidates; unknown values never count as a match (product principle 4).
- Duplicate candidates only arise between distinct listings; a repeated source and external identifier never reaches detection because ingestion updates the existing listing.
- A pin with `approximate` or `municipality` precision cannot support a distance comparison, so the location criterion falls back to the municipality derived from the pin ([D18](/adr/d18-location-pin-declared-precision/)).
- Linking or unlinking listings changes the read model ([D19](/adr/d19-search-read-model/)) and the consolidation of attributes and history ([D20](/adr/d20-listing-consolidation-rules/)).

## Amendment (2026-11-20)

A review of the feature specifications found two defects in the original criteria, which are corrected here:

- **Same source and external identifier is not a duplicate candidate.** The original decision listed it as a candidate criterion, but the same source and external identifier identify one listing ([HR-F001](/features/hr-f001-ingestion/)): ingestion updates it and never creates a second one, so there is no pair to compare. The criterion is removed.
- **A distance under 100 m is meaningless for imprecise locations.** The original decision applied the 100 m criterion to every pin, but pins with `approximate` or `municipality` precision do not locate the home to that accuracy. When the precision of either location is not `exact`, the 100 m criterion is replaced by "same municipality"; the built area (±5 %) and bedroom criteria still apply.

## Alternatives considered

- **Automatic merging above a confidence threshold:** discarded for the first version because a wrong merge is costly and the volume is small enough for manual review.
