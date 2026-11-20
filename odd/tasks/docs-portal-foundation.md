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
| T2 | Scaffold Starlight in `apps/docs` with i18n (`root` = en, `es`), sidebar groups, site title | delegated | [x] | (pending) |
| T3 | Product + domain + sources pages (en + es) | delegated | [ ] | |
| T4 | ADR template + ADR 0000–0016 (en + es) | delegated | [ ] | |
| T5 | Features (HR-F001…HR-F012 from sections 1–12), architecture overview, operations placeholder (en + es) | delegated | [ ] | |

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

## Next step

T3.
