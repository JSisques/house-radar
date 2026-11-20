---
title: "HR-F001: Listing ingestion"
description: "The system must bring in properties from different sources through independent connectors."
sidebar:
  order: 1
---

## Summary

The system brings listings into House Radar from different sources through independent connectors. Automatic connectors run periodically; the provisional MVP source is a manual import form ([D17](/adr/d17-manual-import-assisted-form/)). Only authorized sources are used ([D3](/adr/d03-source-strategy/)).

## Priority

P0 (source section 1).

## Responsible modules

- `apps/ingestion`: connectors (one per source), scheduled runs, retries, and run records.
- `apps/api`, bounded contexts `ingestion` (sources, runs, manual import use case) and `listings` (listing identity and observations).
- `apps/web`: manual import form and the "check listing" action.
- `packages/domain`: normalized listing model shared by the modules above.

## Dependencies

- [HR-F002](/features/hr-f002-normalization/): every ingested listing is converted to the normalized model.
- [HR-F008](/features/hr-f008-price-history/): runs and manual checks create the observations the history is built from.
- [HR-F012](/features/hr-f012-admin-observability/): run status, errors, and retries are shown to the administrator.
- ADRs: [D3](/adr/d03-source-strategy/), [D7](/adr/d07-queues-and-scheduling/), [D10](/adr/d10-cross-cutting-architecture/), [D17](/adr/d17-manual-import-assisted-form/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want to register a listing I found by pasting its URL and filling in a form, so that I can track it without any scraping.
- As a user, I want new listings from authorized sources to appear automatically, so that I do not have to search every portal by hand.
- As a user, I want to record that I checked a manual listing again, so that its price and status stay current.
- As the administrator, I want failed runs to be retried and recorded, so that temporary problems do not lose data.

## Business rules

- **HR-F001-BR1:** each source has its own connector behind a port ([D10](/adr/d10-cross-cutting-architecture/)). Connectors are independent: a failure or change in one never affects another.
- **HR-F001-BR2:** only authorized sources are used. A connector is not enabled until the terms of use, API, or feed permissions of its source have been reviewed; unauthorized scraping is never used ([D3](/adr/d03-source-strategy/)).
- **HR-F001-BR3:** the target automatic sources are the idealista Search API (pending the access key) and authorized feeds from local agencies in Santiago, in that order. Until a key is granted, manual import is the only active source.
- **HR-F001-BR4:** manual import is an assisted form. The URL is stored as provenance and as a link to the original listing and is never fetched; all data is entered by hand ([D17](/adr/d17-manual-import-assisted-form/)).
- **HR-F001-BR5:** a listing is uniquely identified by its source and its external identifier within that source. Ingesting an identity that already exists updates that listing and never creates a second one.
- **HR-F001-BR6:** automatic connectors run periodically as repeatable BullMQ jobs ([D7](/adr/d07-queues-and-scheduling/)). Each run discovers new listings and re-checks known ones.
- **HR-F001-BR7:** every run records its start, end, outcome, and counts of discovered, updated, unchanged, and failed listings, and processed listings are tracked so they are not imported twice.
- **HR-F001-BR8:** temporary errors are retried automatically with backoff; permanent errors are not retried. Every extraction error is logged with its source, listing identity when known, and cause.
- **HR-F001-BR9:** every run that sees a listing records an observation and updates its date of last check. A listing not seen in N consecutive runs is marked `disappeared` (N is configurable, default 3) ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F001-BR10:** images are only stored or displayed when the source terms allow it; otherwise only the link to the original listing is kept.
- **HR-F001-BR11:** manual listings have no automatic status checks. The user records a new observation with "check listing" (price, still active, check date) or marks the listing as `disappeared` ([D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F001-BR12:** every ingested listing records its source, original URL, external identifier when known, date added, and date of last update.

## Acceptance criteria

- **HR-F001-AC1:** Given a user on the manual import form, When they submit a URL and the required fields, Then a listing is created with the URL stored as provenance and no request is made to the URL.
- **HR-F001-AC2:** Given a manual import where a required field is missing, When the user submits, Then no listing is created and the form shows which fields are missing.
- **HR-F001-AC3:** Given a listing that already exists for a source and external identifier, When an ingestion delivers the same identity, Then the existing listing is updated and no new listing is created.
- **HR-F001-AC4:** Given an automatic source that is enabled, When its scheduled run starts, Then a run record is created with its start time and, on completion, its outcome and counts.
- **HR-F001-AC5:** Given a run in which the source returns a temporary error, When the run is retried and later succeeds, Then the run ends successfully and the retry is recorded.
- **HR-F001-AC6:** Given a run that fails with a permanent error, When the failure is detected, Then the error is recorded with its source and cause and the run is not retried.
- **HR-F001-AC7:** Given an active listing from an automatic source, When it is absent from N consecutive runs, Then its status becomes `disappeared`; with fewer than N absences its status stays `active`.
- **HR-F001-AC8:** Given an active manual listing, When the user runs "check listing" with a new price, Then an observation is recorded with the new price, status, and check date, and the date of last check is updated.
- **HR-F001-AC9:** Given a source whose terms do not allow storing images, When a listing is ingested, Then no image is stored and the link to the original listing is kept.
- **HR-F001-AC10:** Given a source that has not been authorized, When an administrator tries to enable it, Then it stays disabled.

## Edge cases

- Importing a URL that is already stored for a manual listing: the user is warned and offered the existing listing instead of silently creating another.
- A manual listing whose external identifier is unknown: it is identified internally and still can be matched through duplicate detection ([HR-F005](/features/hr-f005-duplicates/)).
- A source returns an empty result: it counts as a run in which no listing was seen, so absences accumulate; the administrator can see this in the run record.
- A run is interrupted midway: processed listings are not lost and the next run continues normally.
- A source changes its response format: the affected listings fail with a recorded error and other sources are unaffected.
- A `disappeared` listing is seen again: it becomes `active` and the observation is recorded.

## Out of scope (MVP)

- Extracting any content from the page behind a manual URL.
- Scraping portals without authorization.
- Importing from several automatic sources at the same time (only manual import is active until the idealista key is granted).

## Open questions

- What identifier does a manual listing use when the user cannot supply an external identifier, and how is the same URL matched on re-import?
- What are the default retry limits, backoff, and run cadence for automatic sources?
- Can the user attach their own photos to a manual listing?

## Related decisions

[D3](/adr/d03-source-strategy/), [D7](/adr/d07-queues-and-scheduling/), [D10](/adr/d10-cross-cutting-architecture/), [D17](/adr/d17-manual-import-assisted-form/), [D20](/adr/d20-listing-consolidation-rules/).
