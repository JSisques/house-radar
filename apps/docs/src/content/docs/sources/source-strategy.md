---
title: Source strategy
description: Which sources House Radar targets, in what order, and the legal considerations.
sidebar:
  order: 1
---

Decision [D3](/adr/d03-source-strategy/) defines the source strategy.

## Order of sources

1. **First target source:** idealista Search API (official, access on request).
2. **Provisional MVP source:** manual import by URL.
3. **Second candidate source:** authorized feeds from local real estate agencies in Santiago.

## idealista Search API

The API key is requested through the [idealista access request form](https://developers.idealista.com/access-request).

- Approval is not automatic.
- Terms of use (quotas, storage, redistribution) will be known once the key is received.
- The idealista connector is designed against the official API contract. It is implemented once access is obtained and it is validated that the terms allow storing snapshots and keeping an own price history.

## Manual URL import

Until API access is granted, manual import by URL unblocks development of normalization, search, property pages, and price history.

## Sources without a known public API

Fotocasa, Habitaclia, and pisos.com have no known public API. Unauthorized scraping is ruled out (product principle 7).

## Legal and operational consideration

Before implementing a connector, review the source's terms of use, APIs, feeds, and permissions. Do not assume that automated extraction is allowed. When there is no authorization, use manual imports, links, or other permitted sources.
