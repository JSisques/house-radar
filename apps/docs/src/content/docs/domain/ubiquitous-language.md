---
title: Ubiquitous language and data model
description: Core domain concepts. Property versus listing, provenance, unknown values, and data kinds.
sidebar:
  order: 1
---

All listings are converted to a common model, regardless of where they come from. This page defines the terms used across the documentation.

## Property vs listing

> Contexts, aggregates and tables built on these terms: [Context map](/architecture/context-map/), [Aggregates](/domain/aggregates/), [Database schema](/architecture/database-schema/).

- **Property**: the real estate asset itself.
- **Listing**: an advertisement published about a property on a given source (portal).

One property can have several listings on different portals. House Radar must distinguish the real property from the listings published about it (product principle 2). In duplicate detection, several listings are linked to the same property; probable matches are flagged for manual review, and two different homes are never merged automatically.

## Provenance

Every piece of data must be traceable to its source and observation date (product principle 3). A listing records:

- Source portal.
- Original URL.
- External identifier (unique within its source).
- Publication date, if known.
- Date added to House Radar.
- Date of last check.
- Listing status: `active`, `disappeared`, or `unknown`.

## Unknown values

Fields must accept unknown values. The absence of a datum in a listing does not mean that the property lacks that feature. Unknown values stay unknown, and features are not inferred without saying so (product principle 4).

## Declared, calculated, and inferred data

The model distinguishes between:

| Kind | Meaning |
| --- | --- |
| Declared | Stated by the advertiser in the listing. |
| Calculated | Derived deterministically from other data (for example, price per square meter when it can be computed). |
| Inferred | Estimated from indirect evidence; it must always be marked as such. |

## Normalized fields

### General information

Listing title, description, price, built area, usable area, plot area, number of bedrooms, number of bathrooms, property type, condition, and year of construction when available.

### Additional features

Garage, garden, swimming pool, terrace, balcony, heating, elevator, energy certificate, land type, water, electricity, and sanitation.

## Observation

An **observation** is a dated record of what House Radar saw about a listing at a point in time: price, whether the listing was still active, and the check date. Observations are created by automatic runs or by the manual "check listing" action ([D20](/adr/d20-listing-consolidation-rules/)). Price history is built from observations.

## Listing status lifecycle

A listing is in one of three states:

| Status | Meaning |
| --- | --- |
| `active` | Seen as available at its last observation. |
| `disappeared` | No longer available: marked by the user (manual sources) or not seen in N consecutive runs (automatic sources; N is configurable, default 3). |
| `unknown` | Not enough evidence to say, for example before the first check. |

Only `active` listings contribute to the representative price and to statistics.

## Location precision

The location of a property is a pin on a map with a declared precision ([D18](/adr/d18-location-pin-declared-precision/)):

| Precision | Meaning |
| --- | --- |
| `exact` | The pin marks the property itself. |
| `approximate` | The pin is near the property but not on it. |
| `municipality` | The pin only identifies the municipality. |

Municipality and province are derived from the pin against official IGN boundaries. The postal code is entered by hand.

## Representative price

The **representative price** of a property is the lowest price among its `active` listings. Search results show it as "N listings, from X €" ([D19](/adr/d19-search-read-model/)). A property without active listings has no representative price.

## Attribute conflict

An **attribute conflict** appears when the listings of a property disagree on an attribute. The property shows the most recent observed value, flags the conflict, and shows each value with its source ([D20](/adr/d20-listing-consolidation-rules/)).

## Duplicate candidate and resolution

A **duplicate candidate** is a pair of listings that the system suggests may belong to the same property. A pair is a candidate when the locations are close (distance under 100 m when both have `exact` precision; the same municipality when either precision is not `exact`), the built areas differ by at most 5 %, and the bedroom count is the same (configurable thresholds). The same source and external identifier is not a candidate: it is the same listing and ingestion updates it. The system never merges automatically. The user resolves each candidate as **same property** (link) or **different property** (dismiss, remembered) ([D21](/adr/d21-duplicate-detection-policy/)).

## Price history

Price history is a core feature (P0). It records snapshots of listings, price changes, relevant feature changes, and disappeared listings.

The history reflects **only what House Radar has observed** since it started collecting a listing. It must not be presented as a complete history prior to the first observation.

## Statistics caveat

Statistics must indicate the size and origin of the sample. Advertised prices are not necessarily actual sale prices.

## Shared model

The normalized domain model is shared as an internal package, `packages/shared-kernel`, typed end to end ([D1 and D2](/adr/d02-repository-strategy/)).
