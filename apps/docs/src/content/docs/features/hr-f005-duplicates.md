---
title: "HR-F005: Duplicate detection"
description: "The same home can be advertised on several portals. House Radar must distinguish the real property from the listings published about it."
sidebar:
  order: 5
---

## Summary

The same home can be advertised on several portals. House Radar distinguishes the real property from the listings published about it. The system suggests duplicate candidates and never merges automatically; the user resolves each candidate as "same property" or "different property" ([D21](/adr/d21-duplicate-detection-policy/)).

## Priority

P0 (source section 5).

## Responsible modules

- `apps/api`, bounded contexts `properties` (property aggregate, linking, dismissed pairs) and `listings` (data compared by the detection).
- `apps/web`: duplicate review screen and the candidate list on the property page.
- `packages/domain`: candidate rules and configurable thresholds.

## Dependencies

- [HR-F001](/features/hr-f001-ingestion/): provides the listings to compare.
- [HR-F002](/features/hr-f002-normalization/): location, built area, bedrooms, source, and external identifier.
- [HR-F004](/features/hr-f004-property-detail/): shows candidates on the property page.
- [HR-F003](/features/hr-f003-search/) and [HR-F008](/features/hr-f008-price-history/): consume the consolidated property after a link.
- ADRs: [D4](/adr/d04-backend-framework/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/), [D21](/adr/d21-duplicate-detection-policy/).

## User stories

- As a user, I want the system to suggest listings that may be the same home, so that I do not see it twice.
- As a user, I want to decide myself whether two listings are the same property, so that two different homes are never merged by mistake.
- As a user, I want a pair I rejected not to be suggested again, so that review is not repetitive.

## Business rules

- **HR-F005-BR1:** the system suggests candidates and never merges automatically. Every link between listings comes from an explicit user action ([D21](/adr/d21-duplicate-detection-policy/)).
- **HR-F005-BR2:** the same source and the same external identifier is not a duplicate candidate: it is the same listing, and ingestion updates it ([HR-F001-BR5](/features/hr-f001-ingestion/)). Candidates only arise between distinct listings.
- **HR-F005-BR3:** a pair of listings is a candidate when the distance between their locations is under 100 m, their built areas differ by at most 5 %, and they have the same number of bedrooms. When the location precision of either listing is not `exact`, the 100 m criterion is replaced by "same municipality"; the built area and bedroom criteria still apply.
- **HR-F005-BR4:** the thresholds (100 m and 5 %) are configurable.
- **HR-F005-BR5:** unknown values never count as a match. A listing without location, built area, or bedrooms cannot be a candidate through BR3.
- **HR-F005-BR6:** the user resolves a candidate as "same property", which links the listings to one property, or as "different property", which dismisses the pair.
- **HR-F005-BR7:** a dismissed pair is remembered and is not suggested again.
- **HR-F005-BR8:** detection is idempotent: running it again does not duplicate an open candidate, a resolved one, or a dismissed one.
- **HR-F005-BR9:** price is not a criterion for being a candidate; it is shown during review, together with address data and the other compared fields, to help the user decide.
- **HR-F005-BR10:** after a link, the property consolidates its listings under the rules of [D20](/adr/d20-listing-consolidation-rules/) and search shows it once ([D19](/adr/d19-search-read-model/)).
- **HR-F005-BR11:** detection runs when a listing is created or when its location, built area, or bedrooms change, and does not block ingestion.
- **HR-F005-BR12:** a link can be undone: the listing moves to a new property. Nothing is lost because the price history is stored per listing ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F005-BR13:** when two properties are linked, the surviving property keeps the most precise location by default; the user can change it.
- **HR-F005-BR14:** the detection thresholds are configured at deployment, through environment variables, in the MVP.

## Acceptance criteria

- **HR-F005-AC1:** Given an ingestion that delivers a source and external identifier of an existing listing, When detection runs, Then the existing listing is updated and no candidate pair is created for it.
- **HR-F005-AC2:** Given two listings 80 m apart with built areas of 100 m² and 104 m² and 3 bedrooms each, When detection runs, Then they appear as a candidate pair.
- **HR-F005-AC3:** Given two listings 120 m apart with the same area and bedrooms, When detection runs, Then they are not a candidate pair.
- **HR-F005-AC4:** Given two listings with built areas of 100 m² and 106 m², When detection runs, Then they are not a candidate through the location criterion.
- **HR-F005-AC5:** Given two listings with different numbers of bedrooms, When detection runs, Then they are not a candidate through the location criterion.
- **HR-F005-AC6:** Given a listing with unknown built area, When detection runs, Then it is not a candidate through the location criterion.
- **HR-F005-AC7:** Given a candidate pair, When the user selects "same property", Then both listings belong to one property and search shows it once.
- **HR-F005-AC8:** Given a candidate pair, When the user selects "different property", Then the pair is dismissed and does not appear in the candidate list.
- **HR-F005-AC9:** Given a dismissed pair, When detection runs again, Then the pair is not suggested again.
- **HR-F005-AC10:** Given a threshold changed in the configuration, When detection runs, Then the new threshold is applied.
- **HR-F005-AC11:** Given a very strong match, When detection runs, Then no listing is linked until the user resolves the candidate.
- **HR-F005-AC12:** Given two listings in the same municipality, one of them with `approximate` precision, with built areas of 100 m² and 104 m² and 3 bedrooms each, When detection runs, Then they appear as a candidate pair whatever the distance between their pins.
- **HR-F005-AC13:** Given two listings in different municipalities, one of them with `approximate` precision, with the same built area and bedrooms, When detection runs, Then they are not a candidate pair.
- **HR-F005-AC14:** Given two listings linked into one property, When the user undoes the link, Then one of the listings moves to a new property and the price history of each listing is intact.
- **HR-F005-AC15:** Given two properties with locations of different precision, When they are linked, Then the surviving property keeps the most precise location and the user can change it.
- **HR-F005-AC16:** Given a threshold set through an environment variable, When the application starts and detection runs, Then that threshold is applied.

## Edge cases

- A listing is a candidate for several others: each pair is resolved independently.
- Linking A with B and B with C results in one property with three listings.
- Candidate listings have different pins for what the user judges to be the same home: the user can still resolve them as the same property.
- A listing changes its location after its pair was dismissed: the dismissal still applies to that pair.
- Resolving while ingestion is running does not lose either decision.
- Two listings of the same source with different external identifiers can still be candidates through the location criterion.

## Out of scope (MVP)

- Automatic merging, with or without a confidence level.
- Comparing photographs or descriptions to detect duplicates.
- Detecting duplicates from address text (geocoding is deferred, [D18](/adr/d18-location-pin-declared-precision/)).

## Related decisions

[D4](/adr/d04-backend-framework/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/), [D21](/adr/d21-duplicate-detection-policy/).
