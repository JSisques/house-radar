---
title: "D34. Visual direction: Folla catastral"
description: "A surveyor's data-sheet visual identity: cool fog-grey palette, three typefaces, and a cartographic hatch that draws unknown values instead of hiding them."
sidebar:
  order: 35
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

`apps/web` is a React + Vite SPA ([D5](/adr/d05-frontend-framework/)) styled with Tailwind and shadcn/ui and organized with atomic design (convention C8, see [Code conventions](/architecture/conventions/)). Texts are internationalized from the start ([D12](/adr/d12-web-internationalization/)). Product principle 4 is "do not invent information": most listings omit fields, and the interface must distinguish "it has none" from "we do not know". A visual direction is needed before the web skeleton so that unknown values, conflicts and price changes have a consistent, accessible representation.

## Decision

**Direction "Folla catastral".** A surveyor's data sheet, not a property showroom. Every datum has a source and a date; what was not measured is drawn as unmeasured land. The full rendered system is in [Design system](/architecture/design-system/).

**Palette** (light / dark):

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| Brétema (background) | `#E6E9E7` | `#1E2A30` | Cool fog grey, never cream; the dark base is Lousa |
| Lousa (ink) | `#1E2A30` | `#E6E9E7` | Main text; dark theme background |
| Musgo (primary) | `#2F5D4E` | `#8CC2AC` | Actions, selection, focus |
| Atlántico (geo) | `#3C6E8F` | `#8DB8D6` | Map, links, geographic data |
| Líquen (accent) | `#D4A017` | `#D4A017` | Scarce accent: new items and price drops; always with dark text |
| Ferruxe (warn) | `#9E4A2F` | `#E39575` | Price rises and errors; never conveyed by color alone |
| Surface | `#F3F5F4` | `#26343B` | Cards and panels |
| Muted | `#4A575E` | `#AEB8B4` | Secondary text |
| Line | `#C3CAC7` | `#3E4E56` | Borders and dividers |
| Hatch | `#9AA4A0` | `#5C6B71` | Unknown-value pattern |
| Map | `#D5DEDB` | `#22323A` | Map background |

**Typography.** Schibsted Grotesk for display (700 to 800, restrained), Public Sans for body and UI, IBM Plex Mono with tabular figures for prices, areas, coordinates and dates.

**Signature: unknown values are drawn.** A value the source does not declare is drawn with a cartographic hatch (135° lines, 1px every 8px, hatch token at 55% opacity so text over it stays legible, in the hatch token), a dashed border and the texts "sin dato" and "no declarado" (translated per locale). It is never rendered as `—`, empty or zero. The price history chart draws the period before the first observation as a hatched "sin observar" area.

**Rules.**

- **Conflicts:** an attribute whose sources disagree gets a Ferruxe border and names the other source's value.
- **Price states:** a drop is a Líquen chip with a down arrow; a rise is a Ferruxe-outlined chip with an up arrow; both state the amount. Líquen is also used for new items, and nowhere else.
- **Approximate location** is drawn as a dashed circle on the map, not as a pin.

**Canvas sources** are versioned in `apps/docs/design/folla-catastral/` as the guide for screens (search, detail, assisted import). The live canvas is private.

## Consequences

- The tokens are implemented as CSS variables plus a Tailwind theme in `apps/web` during the M0 web skeleton slice; components never use raw hex values.
- Unknown rendering is one shared component, so every screen shows missing data the same way and the rule cannot be bypassed by ad hoc `—`.
- Accessibility: text and state colors keep sufficient contrast in both themes (Líquen always carries dark text), and color is never the only signal (arrows and text accompany price changes and errors).
- Fonts come from Google Fonts or are self-hosted; the choice is deferred to the web skeleton, with system font stacks as fallback.
- The distinctive identity depends on discipline: Líquen must stay scarce and the hatch reserved for unknowns.

## Alternatives considered

- **Generic portal look (cream and terracotta, or default shadcn neutral):** familiar but indistinct, and it offers no visual language for unknown values, which would end up hidden behind dashes or blanks. Discarded.
