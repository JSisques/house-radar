---
title: Source strategy
description: Which sources House Radar targets, in what order, and the legal considerations.
sidebar:
  order: 1
---

Decisions [D3](/adr/d03-source-strategy/) and [D37](/adr/d37-fotocasa-detail-connector/) define the source strategy.

## Order of sources

1. **First automated connector:** Fotocasa detail pages ([D37](/adr/d37-fotocasa-detail-connector/)).
2. **Optional:** idealista Search API (official, access on request), if the key is ever granted.
3. **Provisional MVP source:** manual import by URL.
4. **Candidate:** authorized feeds from local real estate agencies in Santiago.
5. **Discovery of new listings:** pending a later decision (portal email alerts, agency feeds or the idealista API).

## Fotocasa detail pages

Fotocasa has no public API. The connector reads individual listing pages only: the single page of a URL the user pastes, and the pages of listings the user already tracks (about once a day, one at a time). It honors `robots.txt`, stops on any CAPTCHA or block, never downloads images, never requests search or list pages, is for private use and is disabled in production. See [D37](/adr/d37-fotocasa-detail-connector/).

## idealista Search API (optional)

The API key is requested through the [idealista access request form](https://developers.idealista.com/access-request).

- Approval is not automatic.
- Terms of use (quotas, storage, redistribution) will be known once the key is received.
- The idealista connector is designed against the official API contract. It is implemented once access is obtained and it is validated that the terms allow storing snapshots and keeping an own price history.

## Manual URL import

Until API access is granted, manual import by URL unblocks development of normalization, search, property pages, and price history.

## Other sources without a known public API

Habitaclia and pisos.com have no known public API. Unauthorized scraping is ruled out (product principle 7). Crawling Fotocasa search or list pages is also rejected: it contradicts its `robots.txt`.

## Legal and operational consideration

Before implementing a connector, review the source's terms of use, APIs, feeds, and permissions. Do not assume that automated extraction is allowed. When there is no authorization, use manual imports, links, or other permitted sources.
