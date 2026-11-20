---
title: "D37. Fotocasa detail-page connector"
description: "A connector that reads individual Fotocasa listing pages, on user import and to refresh tracked listings, for private use only and disabled in production."
sidebar:
  order: 38
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

[D3](/adr/d03-source-strategy/) ruled out unauthorized scraping (product principle 7), and [D17](/adr/d17-manual-import-assisted-form/) made manual import an assisted form in which nothing is read from the portal page. The evidence gathered on 2026-11-20 about Fotocasa is:

- **No API for third parties.** Adevinta / Fotocasa offers no public API or data channel for reading listings. The official integration is for agencies that publish into Fotocasa, not for reading.
- **`robots.txt` (`User-agent: *`).** Search and list pages and their pagination are disallowed (`/buscar/`, `/search/`, `/*/listado`, `/*/list`, `/*/l/2*` to `/*/l/39*`), as are all filter query parameters (`minPrice`, `maxPrice`, `minRooms`, `filter`, `latitude`, `pagination`, `combinedLocationIds`, and others) and the internal APIs (`/mvc/`, `/ws/`). Individual listing pages (`/es/comprar/vivienda/…/<id>/d`) are not disallowed. There is no `Crawl-delay`.
- **Legal notice** (`/es/aviso-legal/ln`, section 3, the part read verbatim). Use is allowed "únicamente para sus propias necesidades" (only for the user's own needs), without commercial exploitation. The notice states: "queda terminantemente prohibido la utilización de los textos, imágenes, anuncios … para su posterior inclusión … en otros sitios web ajenos a la Empresa sin contar con la autorización previa y por escrito" (the use of texts, images and listings for later inclusion in other websites outside the company without prior written authorization is strictly forbidden). It also requires users to "abstenerse de eludir o manipular cualesquiera dispositivos técnicos" (refrain from circumventing or manipulating any technical devices). The part read verbatim does not mention scraping explicitly.

## Decision

Build a **Fotocasa detail-page connector**, scoped to what the portal publishes as allowed:

1. **Import with extraction.** The user pastes a listing URL (as in D17) and the system reads **that single page** to prefill the assisted form. The user reviews and confirms.
2. **Refresh of tracked listings.** Listings already imported are re-read from **their own page** at a low rate (by default once a day, one at a time) to record observations (price, still published) for the history.
3. **Hard rules.** `robots.txt` is read and honored before every request; the connector sends an identifiable User-Agent; on a CAPTCHA, a block or any anti-bot device the connector **stops** and reports it, and never bypasses it (the legal notice forbids circumvention); images are not downloaded, only linked; no search, list or pagination pages are requested.
4. **Private use only.** The connector is enabled in local and staging (private, reachable only through Tailscale, [D35](/adr/d35-environments-and-staging-deployment/)) and **disabled in production**. Showing this data to third parties requires Fotocasa's written authorization.
5. **Isolated adapter.** It is implemented as a connector adapter behind the ingestion port ([D10](/adr/d10-cross-cutting-architecture/), [D23](/adr/d23-ingestion-concurrency-model/)), so a change in Fotocasa's terms or a block can switch it off without affecting anything else.

Automatic **discovery** of new listings is deferred to a later decision.

## Consequences

- There is no automatic discovery yet: listings enter through the user's pasted URLs only.
- The connector is disabled in production until written authorization exists.
- It may break, or have to be switched off, if Fotocasa changes its terms or blocks the connector.
- History exists only for tracked listings, that is, those the user already imported.
- Manual entry remains the fallback and the user always confirms the prefilled data.

## Alternatives considered

- **Crawler of Fotocasa search pages:** rejected. It contradicts `robots.txt` and product principle 7.
- **Email-alert discovery** (portal search alerts to a dedicated mailbox, then URLs to the detail connector), **authorized agency feeds** ([D3](/adr/d03-source-strategy/)) and the **idealista API** (if the key is granted): deferred to the discovery decision.

## Amendment of earlier decisions

This decision amends [D3](/adr/d03-source-strategy/) and [D17](/adr/d17-manual-import-assisted-form/) and makes [product principle 7](/product/principles/) precise.
