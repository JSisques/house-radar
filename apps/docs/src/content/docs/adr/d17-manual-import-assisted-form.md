---
title: "D17. Manual import as an assisted form"
description: "Manual import is an assisted form: the URL is stored as provenance and the data is entered by hand. No content is extracted from the page."
sidebar:
  order: 18
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

[D3](/adr/d03-source-strategy/) makes manual import by URL the provisional MVP source while the idealista Search API key is pending. Fetching and parsing a portal page would be unauthorized scraping (product principle 7), so the import cannot depend on reading the content behind the URL.

## Decision

Manual import is an assisted form. The user pastes the URL of the original listing, which is stored as provenance and as a link to the original, and enters every data point by hand. House Radar does not download, parse, or extract any content from the page behind the URL. Price updates for manually imported listings are also manual.

## Consequences

- The URL is provenance only: source, original link, and external identifier when the user can supply it. It is never fetched.
- The form feeds the same normalization pipeline as any other connector ([HR-F002](/features/hr-f002-normalization/)), so every manually imported datum is marked as declared by the user.
- Manual listings have no automatic status checks. The user records new observations with the "check listing" action and marks listings as disappeared ([D20](/adr/d20-listing-consolidation-rules/)).
- No legal review of any portal's terms is required for this source, because no portal content is accessed.
- Data entry effort falls on the user; the form must keep required fields to a minimum and accept unknown values.

## Amendment (2026-11-20)

[D37](/adr/d37-fotocasa-detail-connector/) amends this decision. The assisted form may be prefilled by reading the single page of the pasted URL when a detail connector exists for that portal. Manual entry remains the fallback and the user always confirms the data. Where no such connector exists, the original decision above applies unchanged.

## Alternatives considered

- **URL plus pasted text parsed locally:** the user pastes the listing text and House Radar extracts fields from it. Discarded for the MVP: parsing is fragile and each portal formats text differently, and it adds an extraction component that would be replaced by the official connector. It remains a possible later improvement.
