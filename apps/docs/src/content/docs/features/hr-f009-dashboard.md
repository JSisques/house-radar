---
title: "HR-F009: Dashboard and statistics"
description: "Aggregated view of the collected data."
sidebar:
  order: 9
---

## Summary

An aggregated view of the collected data. Statistics are computed over active properties and always state their sample size and provenance, because advertised prices are not actual sale prices ([D20](/adr/d20-listing-consolidation-rules/)).

## Priority

P1 (source section 9).

## Responsible modules

- `apps/api`, bounded contexts `properties` (counts, distributions, price statistics) and `pricing-history` (evolution over time).
- `apps/web`: dashboard screen and charts behind a charts adapter ([D10](/adr/d10-cross-cutting-architecture/)).
- `packages/domain`: statistic definitions shared by API and web.

## Dependencies

- [HR-F002](/features/hr-f002-normalization/): property type, built area, location, and price per square meter.
- [HR-F003](/features/hr-f003-search/): representative price and the active-property definition.
- [HR-F008](/features/hr-f008-price-history/): observations for the evolution of prices.
- [HR-F001](/features/hr-f001-ingestion/): source of each listing, used for provenance.
- ADRs: [D6](/adr/d06-persistence/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want an overview of what House Radar has collected, so that I understand the state of the data.
- As a user, I want statistics by municipality, so that I can compare areas.
- As a user, I want every figure to tell me how many properties it is based on, so that I do not over-trust a small sample.

## Business rules

- **HR-F009-BR1:** statistics are computed over active properties, those with at least one active listing, unless a figure states otherwise ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F009-BR2:** every statistic displays its sample size and provenance, that is, how many properties it covers and from which sources. A visible notice states that advertised prices are not actual sale prices.
- **HR-F009-BR3:** the dashboard shows the total number of collected properties (all properties, including those without active listings), the number of active listings, and the number of new listings.
- **HR-F009-BR4:** price statistics (average price, median price) use the representative price of each active property ([D19](/adr/d19-search-read-model/)).
- **HR-F009-BR5:** average price per square meter uses the built area only. Properties without built area are excluded and the sample size reflects it ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F009-BR6:** average home area uses the built area; properties with unknown built area are excluded from it and from its sample size.
- **HR-F009-BR7:** the dashboard shows the distribution by property type and the geographic distribution, using the municipality and province derived from pins ([D18](/adr/d18-location-pin-declared-precision/)). Properties with unknown type or location are shown as "unknown" and not dropped.
- **HR-F009-BR8:** the dashboard shows the evolution of the prices of the collected listings over time, built from observations ([HR-F008](/features/hr-f008-price-history/)), stating the date of the first observation.
- **HR-F009-BR9:** statistics by municipality group active properties by derived municipality, each with its own sample size.
- **HR-F009-BR10:** no statistic is shown without data; an empty dataset shows an empty state, never zeros presented as results.
- **HR-F009-BR11:** all labels, number formats, and currency formats are Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)); charts provide a textual alternative.
- **HR-F009-BR12:** a "new listing" is a listing first observed within the last 7 days.
- **HR-F009-BR13:** the price evolution chart plots the median.
- **HR-F009-BR14:** when a statistic covers fewer than 5 properties, it is shown with a small-sample warning; it is never hidden.

## Acceptance criteria

- **HR-F009-AC1:** Given 10 properties of which 8 have an active listing, When the dashboard is shown, Then the total of collected properties is 10 and statistics refer to 8.
- **HR-F009-AC2:** Given active properties with representative prices 100 000 €, 200 000 €, and 600 000 €, When the dashboard is shown, Then the average price is 300 000 € and the median is 200 000 €, with a sample size of 3.
- **HR-F009-AC3:** Given 4 active properties of which 1 has no built area, When average price per square meter is shown, Then it is computed over 3 properties and the sample size says 3.
- **HR-F009-AC4:** Given any statistic, When it is displayed, Then it shows its sample size and provenance.
- **HR-F009-AC5:** Given the dashboard, When it is displayed, Then a notice states that advertised prices are not actual sale prices.
- **HR-F009-AC6:** Given properties of several types, When the dashboard is shown, Then the distribution by type lists each type with its count, including "unknown".
- **HR-F009-AC7:** Given properties in two municipalities, When the statistics by municipality are shown, Then each municipality shows its own average price and sample size.
- **HR-F009-AC8:** Given properties without a pin, When the geographic distribution is shown, Then they appear under "unknown location".
- **HR-F009-AC9:** Given a listing that disappears, When the dashboard is recalculated, Then it no longer counts as active and the property leaves the statistics if it has no other active listing.
- **HR-F009-AC10:** Given observations over time, When the dashboard is shown, Then the price evolution chart displays the series and the date of the first observation.
- **HR-F009-AC11:** Given no collected data, When the dashboard is shown, Then an empty state is displayed instead of zero values.
- **HR-F009-AC12:** Given a listing first observed 5 days ago and another 10 days ago, When the number of new listings is shown, Then only the first counts.
- **HR-F009-AC13:** Given price observations over time, When the price evolution chart is shown, Then it plots the median.
- **HR-F009-AC14:** Given a statistic computed over 4 properties, When it is displayed, Then it is shown with a small-sample warning.

## Edge cases

- A municipality with a single property: its statistics are shown with sample size 1, which is stated plainly.
- Prices of very different magnitudes distort the average: the median is shown next to it.
- A property linked from two listings counts once.
- Properties whose listings come only from one source: provenance shows that single source.
- Data changing while the dashboard is open: figures update on reload and show their calculation time.
- Statistics by municipality for properties with municipality-level precision pins: they are included at municipality level.

## Out of scope (MVP)

- Market value estimation and investment profitability ([out of scope](/product/out-of-scope/)).
- User-defined dashboards or custom metrics.
- Exporting statistics.

## Related decisions

[D6](/adr/d06-persistence/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).
