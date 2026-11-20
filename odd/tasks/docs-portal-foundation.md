# Feature: docs-portal-foundation

## Objective

Bootstrap the `house-radar` monorepo root and the Astro + Starlight documentation portal (`apps/docs`), migrating the product draft and the decision log (D0–D16) into structured, bilingual documentation.

## Problem / Why

All product and technical decisions live in a single Spanish draft (`apps/docs/reference/house-radar-mvp.es.md`). The project is docs-first: everything must be defined and navigable before any application code is written.

## Scope

- Minimal monorepo root (pnpm workspaces, Node/pnpm pinned). No Turborepo/CI yet.
- `apps/docs`: Astro + Starlight, i18n with English as default locale (source of truth) and Spanish translation.
- Content sections: product, features, architecture, adr, domain, sources, operations.
- One ADR per decision D0–D16 plus template.

Out of scope: application code (api, web, ingestion), CI workflows, Docker Compose, code conventions.

## Constraints

- Source of truth for content: `apps/docs/reference/house-radar-mvp.es.md` (sections 0–18).
- English pages first; Spanish pages are translations with the same slugs under `es/`.
- Do not invent decisions not present in the source document.
- TDD: strict TDD (D14) applies to production code; this feature is content + site config, so verification is `astro check` + `astro build` (no unit tests apply).

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | Monorepo root: `package.json` (private, workspaces, `packageManager`), `pnpm-workspace.yaml`, `.nvmrc`, root `README.md` | delegated (writer trigger: 2+ files) | [x] | 4f42380 |
| T2 | Scaffold Starlight in `apps/docs` with i18n (`root` = en, `es`), sidebar groups, site title | delegated | [x] | 1c7e911 |
| T3 | Product + domain + sources pages (en + es) | delegated | [x] | 096f737 |
| T4 | ADR template + ADR 0000–0016 (en + es) | delegated | [x] | fbcd48d |
| T5 | Features (HR-F001…HR-F012 from sections 1–12), architecture overview, operations placeholder (en + es) | delegated | [x] | (pending) |

## Acceptance criteria

- `pnpm install` and `pnpm --filter docs build` succeed.
- `astro check` reports no errors.
- Every English page has a Spanish counterpart with the same slug.
- Decision log D0–D16 fully represented as ADRs.

## Checks

- `pnpm --filter docs exec astro check`
- `pnpm --filter docs build`

## Review (RDD)

RDD mode: on (default). Assess per work-unit commit.

## Progress / Evidence

- Branch `docs/portal-foundation` created from `main` (e05273d chore: initialize repository).
- T1: monorepo root created; Node 24 LTS chosen for `.nvmrc` and engines (installed 26.7.0; Astro 7 requires >=22.23.4).
- T2: Astro 7.4.13 + Starlight 0.43.1 scaffolded in `apps/docs`; TypeScript pinned to 5.9.3 (`@astrojs/check` volar needs TS<7). Hashes are recorded in the following commit (a commit cannot contain its own hash).
- T3: product, domain and sources pages added (en + es). Links to ADR slugs (`/adr/dNN-...`) resolve once T4 lands.
- T4: ADR template + D00–D16 (en + es) plus ADR index. File naming `dNN-slug.md` (ID = decision ID). Shared consequences (D1/D2, D9/D10) repeated in both ADRs; D8 and D16 have no source consequences (stated as such).
- T5: features index + HR-F001..F012, architecture and operations overviews (en + es). Verified: astro check 0 errors, build 85 pages, en/es parity, no broken internal links.

## Next step

Review and merge (user decision).
