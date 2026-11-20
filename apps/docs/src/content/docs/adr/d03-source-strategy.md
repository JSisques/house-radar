---
title: "D3. Source strategy"
description: "First target source: idealista Search API (official, access on request). Provisional MVP source: manual import by URL. Second candidate sour"
sidebar:
  order: 4
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

House Radar must ingest listings only through authorized means (product principle 7).

## Decision

First target source: idealista Search API (official, access on request). Provisional MVP source: manual import by URL. Second candidate source: authorized feeds from local real estate agencies in Santiago.

## Consequences

- The idealista Search API key is requested at <https://developers.idealista.com/access-request>. Approval is not automatic and the terms of use (quotas, storage, redistribution) will be known upon receiving it.
- Until then, manual import by URL unblocks development of normalization, search, property pages, and history.
- The idealista connector is designed against the official API contract and implemented once access is obtained and it is validated that its terms allow storing snapshots and an own history.

## Amendment (2026-11-20)

[D37](/adr/d37-fotocasa-detail-connector/) amends this decision. The first automated connector is the Fotocasa detail-page connector, which reads individual listing pages under the rules of D37. The idealista Search API becomes optional, in case the key is ever granted. Authorized agency feeds remain a candidate. Unauthorized crawling of search and list pages remains rejected.

## Alternatives considered

- Fotocasa, Habitaclia, and pisos.com: no known public API; unauthorized scraping is ruled out (product principle 7).
