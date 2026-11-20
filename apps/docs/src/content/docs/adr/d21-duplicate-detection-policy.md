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

The system suggests duplicate candidates and never merges automatically. A pair of listings is a candidate when either:

- they have the same source and the same external identifier; or
- the distance between their locations is under 100 m, their built areas differ by at most 5 %, and they have the same number of bedrooms.

The thresholds (100 m, 5 %) are configurable. The user resolves each candidate as "same property" (the listings are linked to one property) or "different property" (the candidate is dismissed and the decision is remembered, so the pair is not suggested again).

## Consequences

- Candidate detection is a suggestion mechanism; every link between listings comes from an explicit user action.
- Dismissed pairs are persisted, so detection is idempotent and does not nag.
- Listings without location, built area, or bedrooms cannot match by the second criterion; unknown values never count as a match (product principle 4).
- Linking or unlinking listings changes the read model ([D19](/adr/d19-search-read-model/)) and the consolidation of attributes and history ([D20](/adr/d20-listing-consolidation-rules/)).

## Alternatives considered

- **Automatic merging above a confidence threshold:** discarded for the first version because a wrong merge is costly and the volume is small enough for manual review.
