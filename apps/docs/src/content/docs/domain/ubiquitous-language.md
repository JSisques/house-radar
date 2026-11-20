---
title: Ubiquitous language and data model
description: Core domain concepts. Property versus listing, provenance, unknown values, and data kinds.
sidebar:
  order: 1
---

All listings are converted to a common model, regardless of where they come from. This page defines the terms used across the documentation.

## Property vs listing

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

## Price history

Price history is a core feature (P0). It records snapshots of listings, price changes, relevant feature changes, and disappeared listings.

The history reflects **only what House Radar has observed** since it started collecting a listing. It must not be presented as a complete history prior to the first observation.

## Statistics caveat

Statistics must indicate the size and origin of the sample. Advertised prices are not necessarily actual sale prices.

## Shared model

The normalized domain model is shared as an internal package, `packages/domain`, typed end to end ([D1 and D2](/adr/d02-repository-strategy/)).
