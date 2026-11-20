# Folla catastral — design canvas sources

Source files of the House Radar visual direction canvas ("Folla catastral"), approved on 2026-11-20.

- Live canvas (private, owner access): https://claude.ai/artifact/QNTu3Ju5qq638caejSDqmk
- Rendered guide in the docs portal: `apps/docs/src/content/docs/architecture/design-system.md`
- Decision: ADR D34 (`apps/docs/src/content/docs/adr/d34-visual-direction.md`)

## Files

| File | Artboard |
|---|---|
| `canvas.json` | Canvas index (artboard layout) |
| `Main.dc.html` | Visual system: palette, typography, the hatch signature, price states |
| `Search.dc.html` | Search: filter rail, property results, map |
| `Detail.dc.html` | Property detail: data sheet, observed history, listings, duplicate candidate |
| `Import.dc.html` | Assisted manual import: form, location pin and precision, live preview |

## How to use them

These `.dc.html` files are Design Component sources: they render inside the canvas editor (they load its `support.js` runtime) and do not open as standalone pages. Use them as the reference for markup, spacing and copy when building `apps/web` screens. The canonical tokens live in the docs page above and, from M0, in the web design system code.

Example data (listings in Ames, Teo, Boqueixón, prices, coordinates) is illustrative.
