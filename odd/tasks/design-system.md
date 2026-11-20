# Feature: design-system

## Objective

Record the approved visual direction "Folla catastral" in the repository: canvas sources as a versioned guide, a rendered design system page in the docs portal (en + es), ADR D34, and the rules the frontend agent skill must follow.

## Decisions (user-approved 2026-11-20)

- Direction "Folla catastral": a surveyor's data sheet, not a property showroom. Every datum has a source and a date; what was not measured is drawn as unmeasured land.
- Palette (light / dark):
  - Brétema `#E6E9E7` — background (cool fog grey, never cream) / dark surface base Lousa.
  - Lousa `#1E2A30` — main text; dark theme background.
  - Musgo `#2F5D4E` — primary: actions, selection, focus (dark `#8CC2AC`).
  - Atlántico `#3C6E8F` — map, links, geographic data (dark `#8DB8D6`).
  - Líquen `#D4A017` — scarce accent: new items and price drops; always with dark text.
  - Ferruxe `#9E4A2F` — price rises and errors (dark `#E39575`); never conveyed by color alone (arrow or text).
  - Support tokens: surface `#F3F5F4` / `#26343B`, muted `#4A575E` / `#AEB8B4`, line `#C3CAC7` / `#3E4E56`, hatch `#9AA4A0` / `#5C6B71`, map `#D5DEDB` / `#22323A`.
- Typography: Schibsted Grotesk (display, 700–800, restrained), Public Sans (body/UI), IBM Plex Mono with tabular figures (prices, areas, coordinates, dates).
- Signature: unknown values are drawn with a cartographic hatch (135° 1px lines every 8px in the hatch token at 55% opacity, so text over it stays legible, dashed border, "sin dato" + "no declarado"), never `—`, empty or zero. Price history draws the period before the first observation as a hatched "sin observar" area. Attribute conflicts use a ferruxe border and name the other source's value.
- Screens (walking skeleton references): search (filter rail, property results "N anuncios, desde", map with "Buscar en esta zona", approximate location as a dashed circle), detail (data sheet grid, observed history, listings table, duplicate resolution), assisted import (form with "El anuncio no lo dice", map pin with precision, detected municipality, live preview).
- Canvas sources kept in `apps/docs/design/folla-catastral/` as the versioned guide; the live canvas stays at https://claude.ai/artifact/QNTu3Ju5qq638caejSDqmk.

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | Store canvas sources + README in `apps/docs/design/folla-catastral/` | inline (mechanical copy) | [x] | 0bfa161 |
| T2 | ADR D34 visual direction (en + es) + index; docs page `architecture/design-system` (en + es) rendering palette, type and hatch live; link from overview and conventions | delegated (writer trigger: 2+ files) | [x] | fb00217 (ADR D34), 5eb576c (design page) |
| T3 | Frontend agent skill: hard rules for tokens, typography, hatch for unknown, color-not-alone; link the design page and canvas sources | delegated | [x] | b543f7f |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`; visual check of the design page (headless Chrome, light and dark).

## Progress

- T1 done (0bfa161). T2 done: ADR D34 en + es with both indexes (fb00217); design page en + es with Astro components in `apps/docs/src/components/design/`, linked from overview and conventions (5eb576c). T3 done (b543f7f): hard rules in the frontend skill, body ~487 words.
- Route: T2 and T3 delegated to one writer (writer trigger).

## Verification

- `pnpm docs:test`: 4 pass. `pnpm docs:check-i18n`: 67 pages OK. `pnpm docs:check`: 0 errors. `pnpm docs:build`: 135 pages built.
- Visual check (headless Chrome, light and dark, en and es): found and fixed (a) the hatch never rendered — `.hr-ds .hr-unk` was a descendant selector but both classes sit on the same element; now `.hr-ds.hr-unk`; (b) the hatch hurt legibility of text over it — now the hatch token at 55% opacity every 8px (spec updated in ADR D34, page, decision record and canvas sources, canvas republished); (c) unknown cells sat ~16px lower because of Starlight content margins — cells use `not-content`. Re-checked after the fix.
