---
title: "HR-F002: Property management and normalization"
description: "All listings must be converted to a common model, regardless of their origin."
sidebar:
  order: 2
---

## Summary

All listings are converted to a common model regardless of their origin. The model separates the real property from the listings published about it, records provenance for every datum, accepts unknown values, and distinguishes declared, calculated, and inferred data. See [Ubiquitous language](/domain/ubiquitous-language/).

## Priority

P0 (source section 2).

## Responsible modules

- `packages/domain`: normalized model, value objects (price, area, location with precision), and data kinds.
- `apps/api`, bounded contexts `listings` (listing, observations, status) and `properties` (property, consolidation of attributes, location).
- `apps/ingestion`: mapping of each connector payload to the normalized model.
- `apps/web`: manual entry form, including the location pin.

## Dependencies

- [HR-F001](/features/hr-f001-ingestion/): provides the raw data to normalize.
- [HR-F005](/features/hr-f005-duplicates/): links listings to properties.
- [HR-F006](/features/hr-f006-map/): uses the location and its precision.
- ADRs: [D1](/adr/d01-language/), [D2](/adr/d02-repository-strategy/), [D6](/adr/d06-persistence/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want every property described with the same fields, so that I can compare homes from different sources.
- As a user, I want unknown data to stay unknown, so that I never mistake a missing datum for a missing feature.
- As a user, I want to place a pin on a map and say how precise it is, so that the location is honest about its accuracy.
- As a user, I want to see when sources disagree about a property, so that I can judge which value to trust.

## Business rules

- **HR-F002-BR1:** every listing is normalized to one common model, whatever its source. The model is shared through `packages/domain` ([D1](/adr/d01-language/), [D2](/adr/d02-repository-strategy/)).
- **HR-F002-BR2:** the general fields are title, description, price, built area, usable area, plot area, number of bedrooms, number of bathrooms, property type, condition, and year of construction when available.
- **HR-F002-BR3:** the additional features are garage, garden, swimming pool, terrace, balcony, heating, elevator, energy certificate, land type, water, electricity, and sanitation.
- **HR-F002-BR4:** every field accepts an unknown value. The absence of a datum never means the property lacks that feature, and unknown values are never inferred without saying so.
- **HR-F002-BR5:** every datum has a kind: declared (stated by the advertiser or entered by the user), calculated (derived deterministically), or inferred (always marked as such).
- **HR-F002-BR6:** a listing records its source portal, original URL, external identifier, publication date when known, date added, date of last check, and status (`active`, `disappeared`, or `unknown`).
- **HR-F002-BR7:** the location of a property is a pin with a declared precision: `exact`, `approximate`, or `municipality`. Municipality and province are derived from the pin by point-in-polygon against official IGN boundaries in PostGIS; the postal code is entered by hand ([D18](/adr/d18-location-pin-declared-precision/)).
- **HR-F002-BR8:** price per square meter is a calculated datum that uses the built area only. If the built area is unknown, it is unknown; it never falls back to the usable area ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F002-BR9:** when listings of a property disagree on an attribute, the property shows the most recent observed value and flags the conflict with each value and its source ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F002-BR10:** the property exposes a representative price, the lowest price among its active listings; with no active listing it has none ([D19](/adr/d19-search-read-model/)).
- **HR-F002-BR11:** prices are expressed in euros and areas in square meters. User-facing labels and formats are Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).
- **HR-F002-BR12:** property type is a closed list: flat (`piso`), penthouse (`ático`), duplex, studio, detached house, semi-detached or terraced house, rustic house, estate (`finca`), land, and other.
- **HR-F002-BR13:** condition is a closed list: new build, good condition, to renovate, and unknown.
- **HR-F002-BR14:** the energy certificate accepts the values A to G, in process, exempt, and unknown.

## Acceptance criteria

- **HR-F002-AC1:** Given payloads from two different sources, When they are normalized, Then both produce listings with the same set of fields.
- **HR-F002-AC2:** Given a listing that does not state the year of construction, When it is normalized, Then the year is unknown and not zero or empty text.
- **HR-F002-AC3:** Given a listing with built area 100 m² and price 200 000 €, When the property is shown, Then price per square meter is 2 000 €/m² and is marked as calculated.
- **HR-F002-AC4:** Given a listing with usable area but no built area, When price per square meter is requested, Then the value is unknown.
- **HR-F002-AC5:** Given a pin placed inside the boundary of a municipality, When the location is saved, Then the municipality and province are derived and stored with the pin and its precision.
- **HR-F002-AC6:** Given a pin outside every known boundary, When the location is saved, Then municipality and province remain unknown and the pin is kept.
- **HR-F002-AC7:** Given two listings of one property with built areas of 100 m² and 105 m², When the property is shown, Then it shows the value of the most recently observed listing and flags the conflict, listing each value with its source.
- **HR-F002-AC8:** Given a property with two active listings priced 200 000 € and 190 000 €, When the property is read, Then its representative price is 190 000 €.
- **HR-F002-AC9:** Given a listing that disappears, When its status changes, Then the previous observations are kept and the listing no longer counts toward the representative price.
- **HR-F002-AC10:** Given a new listing, When it is saved, Then its source, original URL, date added, and date of last check are recorded.
- **HR-F002-AC11:** Given a listing, When a property type outside the closed list is provided, Then it is rejected; only the listed values are accepted.
- **HR-F002-AC12:** Given a listing, When a condition outside the closed list is provided, Then it is rejected; only the listed values are accepted.
- **HR-F002-AC13:** Given a listing with an energy certificate "in process", When the property is shown, Then the certificate is shown as in process and not as a letter.

## Edge cases

- Contradictory data inside one listing (for example, usable area larger than built area): the values are stored as declared and not corrected silently.
- Negative or zero prices and areas are rejected as invalid input; an unknown value is represented as unknown, not as zero.
- A pin with precision `municipality` is shown and filtered by municipality only, never as a point.
- A listing without a pin has an unknown location and is excluded from spatial filters.
- Moving a pin recalculates municipality and province.
- All listings of a property disappear: the property is kept, has no representative price, and keeps its history.

## Out of scope (MVP)

- Geocoding of addresses ([D18](/adr/d18-location-pin-declared-precision/)).
- Inferring missing features from descriptions or photographs.
- Cadastre (Catastro) data and automatic market value estimation.

## Related decisions

[D1](/adr/d01-language/), [D2](/adr/d02-repository-strategy/), [D6](/adr/d06-persistence/), [D12](/adr/d12-web-internationalization/), [D18](/adr/d18-location-pin-declared-precision/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).
