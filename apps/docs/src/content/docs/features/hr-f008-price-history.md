---
title: "HR-F008: Price history and tracking"
description: "The history is one of the elements that can differentiate House Radar from a traditional real estate search engine."
sidebar:
  order: 8
---

## Summary

Price history is one of the elements that differentiate House Radar from a traditional real estate search engine. Every change to a listing is an observation; history is stored per listing, and the property shows the evolution of its lowest active price ([D20](/adr/d20-listing-consolidation-rules/)). The history only reflects what House Radar has observed.

## Priority

P0 (source section 8).

## Responsible modules

- `apps/api`, bounded context `pricing-history`: observations, snapshots, variation calculations, and property-level series.
- `apps/ingestion`: produces observations on each run.
- `apps/web`: history section and chart on the property page, behind a charts adapter ([D10](/adr/d10-cross-cutting-architecture/)).
- `packages/shared-kernel`: observation and variation definitions.

## Dependencies

- [HR-F001](/features/hr-f001-ingestion/): runs and manual checks create observations.
- [HR-F002](/features/hr-f002-normalization/): normalized attributes whose changes are tracked.
- [HR-F004](/features/hr-f004-property-detail/): displays the history.
- [HR-F005](/features/hr-f005-duplicates/): linking listings changes the property-level series.
- [HR-F009](/features/hr-f009-dashboard/): price evolution statistics.
- ADRs: [D3](/adr/d03-source-strategy/), [D6](/adr/d06-persistence/), [D10](/adr/d10-cross-cutting-architecture/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want to see how the price of a property evolved, so that I can tell whether it has been dropping.
- As a user, I want to know the initial price, the current price, and the variation, so that I can judge the negotiation margin.
- As a user, I want to know when a listing disappeared, so that I understand whether the property is still available.

## Business rules

- **HR-F008-BR1:** history is built from observations. An observation records the listing, the observation date, the price (changed or not), and whether the listing was still active ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F008-BR2:** observations come from automatic runs and from the manual "check listing" action. The initial manual import is the first observation.
- **HR-F008-BR3:** each observation stores a snapshot of the normalized listing, as far as the terms of its source allow storing snapshots and an own history ([D3](/adr/d03-source-strategy/)).
- **HR-F008-BR4:** price history is stored per listing. A price change is recorded when an observation shows a price different from the previous one; relevant changes to other attributes are recorded too.
- **HR-F008-BR5:** the property shows the evolution of its lowest active price: at each moment, the lowest price among the listings that were active at that moment.
- **HR-F008-BR6:** the initial known price is the price of the first observation; the current price is the price of the latest observation. For a property, they are the first and the current representative price.
- **HR-F008-BR7:** absolute variation is current price minus initial price; percentage variation is that difference divided by the initial price. Both are calculated data.
- **HR-F008-BR8:** a listing is recorded as disappeared by a manual action or, for automatic sources, after N consecutive runs without seeing it (default 3). The disappearance is a history event ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F008-BR9:** the history reflects only what House Radar has observed since the first observation. The interface states the date of the first observation and never presents the history as complete.
- **HR-F008-BR10:** the evolution is shown in a chart with an accessible textual alternative. Prices are in euros, with Spanish-first formats ([D12](/adr/d12-web-internationalization/)).
- **HR-F008-BR11:** observations are immutable: a correction is a new observation.
- **HR-F008-BR12:** observations are kept forever; there is no compaction in the MVP.

## Acceptance criteria

- **HR-F008-AC1:** Given a new listing, When it is created, Then a first observation with its price and date is stored.
- **HR-F008-AC2:** Given a listing priced 200 000 €, When an observation shows 190 000 €, Then a price change is recorded and the history has two points.
- **HR-F008-AC3:** Given a listing, When an observation shows the same price, Then no price change is recorded and the date of last check is updated.
- **HR-F008-AC4:** Given an initial price of 200 000 € and a current price of 190 000 €, When the history is shown, Then the absolute variation is -10 000 € and the percentage variation is -5 %.
- **HR-F008-AC5:** Given a property with a single observation, When the history is shown, Then initial and current price are equal and the variation is zero.
- **HR-F008-AC6:** Given a property with two active listings priced 200 000 € and 190 000 €, When the 190 000 € listing disappears, Then the property series shows the lowest active price rising to 200 000 € at that date.
- **HR-F008-AC7:** Given an automatic source and N = 3, When a listing is not seen in three consecutive runs, Then a disappearance is recorded in its history.
- **HR-F008-AC8:** Given a listing first observed on 2026-11-20, When the history is shown, Then the interface states that it covers data from 2026-11-20 onward.
- **HR-F008-AC9:** Given an observation with a changed attribute other than price, When it is stored, Then the change is recorded in the history.
- **HR-F008-AC10:** Given a property with history, When the user opens the property page, Then a chart shows the evolution of its lowest active price.
- **HR-F008-AC11:** Given a stored observation, When a later observation differs, Then the earlier observation is not modified.
- **HR-F008-AC12:** Given observations of any age, When the price history is shown, Then all of them are available.

## Edge cases

- Observation with an unknown price: the observation is stored with unknown price and does not count as a price change.
- A listing that disappears and later reappears: both events are recorded and the listing becomes active again.
- Price returns to an earlier value: a new change is recorded; earlier points are not merged.
- Linking two listings after both have history: the property series is recalculated from per-listing histories without altering them.
- A property with no active listing: the series ends at the disappearance and no current price is shown.
- The user checks a manual listing several times on the same day: each check is an observation.

## Out of scope (MVP)

- Price drop prediction ([out of scope](/product/out-of-scope/)).
- Reconstructing history before the first observation.
- Historical data from external sources.
- Alerts on price changes ([HR-F011](/features/hr-f011-notifications/), post-MVP).

## Related decisions

[D3](/adr/d03-source-strategy/), [D6](/adr/d06-persistence/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D20](/adr/d20-listing-consolidation-rules/), [D28](/adr/d28-bounded-context-map/), [D29](/adr/d29-aggregate-boundaries/).

See also: [Aggregates](/domain/aggregates/), [Context map](/architecture/context-map/).
