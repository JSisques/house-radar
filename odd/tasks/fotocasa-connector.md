# Feature: fotocasa-connector

## Objective

Record the decision to build a Fotocasa detail-page connector (user-initiated extraction of individual listings and daily refresh of tracked listings), amending D3 and D17 and making product principle 7 precise; update the docs and the roadmap issues accordingly. Automatic discovery is explicitly deferred.

## Evidence (verified 2026-11-20)

- No public API or data channel for third parties (Adevinta / Fotocasa). The official integration is for agencies publishing into Fotocasa, not for reading.
- `robots.txt` (`User-agent: *`): search and list pages and their pagination are disallowed (`/buscar/`, `/search/`, `/*/listado`, `/*/list`, `/*/l/2*`…`/*/l/39*`), as are all filter query parameters (`minPrice`, `maxPrice`, `minRooms`, `filter`, `latitude`, `pagination`, `combinedLocationIds`…) and the internal APIs (`/mvc/`, `/ws/`). Individual listing pages (`/es/comprar/vivienda/…/<id>/d`) are not disallowed. No `Crawl-delay`.
- Legal notice (`/es/aviso-legal/ln`, section 3, verbatim part read): use "únicamente para sus propias necesidades", no commercial exploitation; "queda terminantemente prohibido la utilización de los textos, imágenes, anuncios … para su posterior inclusión … en otros sitios web ajenos a la Empresa sin contar con la autorización previa y por escrito"; users must "abstenerse de eludir o manipular cualesquiera dispositivos técnicos". No explicit mention of scraping in the part read verbatim.

## Decision F1 (user-approved 2026-11-20)

Build a **Fotocasa detail-page connector**, scoped to what the portal publishes as allowed:

1. **Import with extraction**: the user pastes a listing URL (as in D17) and the system reads **that single page** to prefill the assisted form; the user reviews and confirms.
2. **Refresh of tracked listings**: listings already imported are re-read from **their own page** at a low rate (default once a day, one at a time) to record observations (price, still published) for the history.
3. **Hard rules**: `robots.txt` read and honored before every request; identifiable User-Agent; on CAPTCHA, block or any anti-bot device the connector **stops** and reports (never bypasses — the legal notice forbids it); images are not downloaded, only linked; no search, list or pagination pages are requested.
4. **Private use only**: enabled in local and staging (private, Tailscale); **disabled in production** — showing that data to third parties requires Fotocasa's written authorization.
5. Implemented as a connector adapter behind the ingestion port (D10, D23): a change in Fotocasa's terms or a block can switch it off without affecting anything else.

- Automatic **discovery** of new listings is **deferred** ("we will fight about it later"). Options on the table for that later decision: portal email alerts (search alerts → dedicated mailbox → URLs → detail connector), authorized agency feeds (D3), the idealista API (if granted). A crawler of Fotocasa search pages was discussed and is not approved: it contradicts `robots.txt` and principle 7.

### Amendments

- **D3 (sources)**: first automated connector = Fotocasa detail pages under the rules above; idealista API becomes optional (if the key is ever granted); authorized agency feeds remain a candidate; unauthorized crawling of search/list pages remains rejected.
- **D17 (manual import)**: the assisted form may be prefilled by reading the pasted URL's single page when a detail connector exists for that portal; manual entry remains the fallback and the user always confirms.
- **Principle 7** made precise: automated reading is allowed only for individual listing pages, initiated by the user or for listings the user already tracks, honoring `robots.txt`, never bypassing technical protections, for private use.

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | ADR D37 Fotocasa detail-page connector (en + es) + index; amendment notes appended to D3 and D17 (en + es); principle 7 precision on `product/principles` (en + es); `sources/source-strategy` (en + es) updated; HR-F001 related decisions | delegated (writer trigger: 2+ files) | [ ] | |
| T2 | GitHub issue updates (to be confirmed by the user): new M5 slices for the Fotocasa detail connector; idealista slices #107/#108 marked optional | inline (gh) | [ ] | |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`.
