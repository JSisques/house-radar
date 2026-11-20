---
title: "HR-F004: Property detail pages"
description: "Each property will have its own detail page."
sidebar:
  order: 4
---

## Summary

Each property has its own detail page. It shows the consolidated data of the property, every listing published about it with its source, price, and link to the original, any conflicts between sources, the price history, and possible duplicates.

## Priority

P0 (source section 4).

## Responsible modules

- `apps/web`: property detail screen and its components.
- `apps/api`, bounded contexts `properties` (consolidated view), `listings` (listings and observations), and `pricing-history` (history shown on the page).
- `packages/shared-kernel`: consolidation rules and data kinds.

## Dependencies

- [HR-F002](/features/hr-f002-normalization/): fields, location, and data kinds.
- [HR-F005](/features/hr-f005-duplicates/): possible duplicate listings and their resolution.
- [HR-F008](/features/hr-f008-price-history/): price history and chart.
- [HR-F006](/features/hr-f006-map/): location on a map.
- [HR-F007](/features/hr-f007-favorites-saved-searches/): mark the property as a favorite.
- [HR-F001](/features/hr-f001-ingestion/): the "check listing" action for manual listings.
- ADRs: [D3](/adr/d03-source-strategy/), [D12](/adr/d12-web-internationalization/), [D17](/adr/d17-manual-import-assisted-form/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want to see everything known about a property in one place, so that I can decide whether it is worth a visit.
- As a user, I want to see where each listing comes from and open the original, so that I can verify the data at its source.
- As a user, I want to see when sources disagree, so that I know which data to double-check.

## Business rules

- **HR-F004-BR1:** the page shows title and description, representative price, main features, additional features, location with its declared precision, built area, plot area, and price per square meter when it can be calculated.
- **HR-F004-BR2:** the page lists every listing of the property with its source, its own price, its status, its date added, and a link to the original listing. The link to the original source is part of the P0 scope.
- **HR-F004-BR3:** the representative price is the lowest price among active listings and is presented together with the number of listings ([D19](/adr/d19-search-read-model/)).
- **HR-F004-BR4:** when listings disagree on an attribute, the page shows the most recent observed value, flags the conflict, and shows each value with its source ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR5:** unknown values are displayed as unknown; the page never shows a blank, zero, or inferred value without marking it. Calculated and inferred data are marked as such.
- **HR-F004-BR6:** price per square meter is shown only when the built area is known; otherwise it is shown as unknown ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR7:** the photo gallery shows only images whose use is allowed by their source ([HR-F001](/features/hr-f001-ingestion/)). With no allowed images, the page shows no gallery and keeps the link to the original.
- **HR-F004-BR8:** the page shows the date the property was added and the date of its last update, and the available price history ([HR-F008](/features/hr-f008-price-history/)) with the notice that it only covers observed data.
- **HR-F004-BR9:** the page shows possible duplicate listings as candidates for review ([HR-F005](/features/hr-f005-duplicates/)); it never links them automatically.
- **HR-F004-BR10:** for each manual listing the page offers "check listing" and "mark as disappeared" ([D17](/adr/d17-manual-import-assisted-form/), [D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR11:** all labels, number formats, and dates are Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).
- **HR-F004-BR12:** the data of a manual listing can be edited. Price and status change only through "check listing" (a new observation). Corrections to descriptive data are edited in place and an audit record is kept.
- **HR-F004-BR13:** the title and description shown for a property come from its most recently observed listing; the other listings' values are visible in the property's listings tab.

## Acceptance criteria

- **HR-F004-AC1:** Given a property with two listings from different sources, When the user opens its page, Then both listings appear with source, price, status, and a link to their original.
- **HR-F004-AC2:** Given listings that disagree on bedrooms (3 and 4), When the page is shown, Then it shows the most recent value, marks the conflict, and shows both values with their sources.
- **HR-F004-AC3:** Given a property without built area, When the page is shown, Then price per square meter appears as unknown.
- **HR-F004-AC4:** Given a property whose pin has precision `approximate`, When the page is shown, Then the location indicates that it is approximate.
- **HR-F004-AC5:** Given a property with no listing images allowed, When the page is shown, Then no gallery is displayed and the link to the original is present.
- **HR-F004-AC6:** Given a property with price observations, When the page is shown, Then the price history appears with a notice that it starts at the first observation.
- **HR-F004-AC7:** Given pending duplicate candidates for the property, When the page is shown, Then they are listed for review and none is linked until the user resolves it.
- **HR-F004-AC8:** Given an active manual listing, When the user selects "mark as disappeared", Then its status becomes `disappeared` and the representative price is recalculated.
- **HR-F004-AC9:** Given a property with an unknown value, When the page is shown, Then the value is displayed as unknown and not as empty or zero.
- **HR-F004-AC10:** Given an identifier that does not exist, When the user opens the page, Then a "property not found" message is shown.
- **HR-F004-AC11:** Given a manual listing, When the user corrects a descriptive field, Then the listing is updated in place and an audit record of the change is kept.
- **HR-F004-AC12:** Given a manual listing, When the user wants to change its price or status, Then it is done through "check listing" and records a new observation; the price and status cannot be edited directly.
- **HR-F004-AC13:** Given a property with listings whose titles differ, When the page is shown, Then it shows the title and description of the most recently observed listing and the others appear in the listings tab.

## Edge cases

- A property with no active listing: the page is reachable, shows the last known data and status, and has no representative price.
- A listing without a source link (for example, an incomplete manual import): no link is shown for it.
- A very long description: it is shown in full or collapsed, never truncated without a way to read it.
- Several conflicting attributes at once: each is flagged independently.
- A property merged into another after a duplicate resolution: its previous page URL redirects to the surviving property.

## Out of scope (MVP)

- Contacting the advertiser from House Radar.
- Server-side rendering of property pages ([D5](/adr/d05-frontend-framework/)).
- Photo analysis ([out of scope](/product/out-of-scope/)).

## Related decisions

[D3](/adr/d03-source-strategy/), [D12](/adr/d12-web-internationalization/), [D17](/adr/d17-manual-import-assisted-form/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).
