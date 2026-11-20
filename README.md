# House Radar

Real estate discovery and analysis for Galicia, built around its own database of properties, listings and observed price history.

[![docs](https://github.com/JSisques/house-radar/actions/workflows/docs.yml/badge.svg)](https://github.com/JSisques/house-radar/actions/workflows/docs.yml)
[![codeql](https://github.com/JSisques/house-radar/actions/workflows/codeql.yml/badge.svg)](https://github.com/JSisques/house-radar/actions/workflows/codeql.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

## What it is

House Radar centralizes listings from different sources, normalizes their data, and lets you search, compare and track properties from one application. The initial scope is Galicia, starting with the Santiago de Compostela area.

It is a personal tool built to real-product standards (ADRs, tests, CI, observability), and a portfolio piece that may evolve into a public product. The MVP stays bounded: one user, Galicia, one source.

Seven principles guide it:

1. The own database is the main asset.
2. Separate property and listing.
3. Preserve provenance.
4. Do not invent information.
5. Design for multiple sources.
6. Usefulness over AI.
7. Respect source terms.

## Status

The definition phase is complete: product, domain, architecture, conventions, design system, environments and the full issue plan are documented. No application code exists yet. Milestone M0 (Foundation) is next. See the [roadmap](apps/docs/src/content/docs/product/roadmap.md) and the [project board](https://github.com/users/JSisques/projects/16).

## Key ideas

- **Properties vs listings.** A real property can have several listings on different portals. Search returns properties.
- **Observed-only price history.** Prices come from observations of listings, each with its source and date. Nothing is interpolated.
- **Unknown is drawn.** A missing value stays unknown and is shown as such, never hidden or inferred silently.
- **Sources policy.** Ingestion relies on APIs, feeds, permissions or other authorized methods. Reading individual listing pages is allowed only as defined in [D37](apps/docs/src/content/docs/adr/d37-fotocasa-detail-connector.md): user-initiated or for tracked listings, honoring `robots.txt`, never bypassing protections, for private use.

## Architecture at a glance

```text
house-radar/
├── apps/
│   ├── api/          # Backend API
│   ├── web/          # Frontend: search, property pages, map, dashboard
│   ├── ingestion/    # Collection workers and connectors
│   └── docs/         # Documentation portal
├── packages/
│   ├── building-blocks/  # Own DDD building blocks
│   └── shared-kernel/    # Shared kernel
└── infra/            # Docker Compose and deployment configuration
```

Only `apps/docs` exists today; the rest is planned.

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Backend | NestJS with CQRS and DDD |
| Frontend | React + Vite, TanStack Router and Query |
| Persistence | PostgreSQL + PostGIS, MikroORM |
| Queues | BullMQ + Redis |
| API | OpenAPI REST |
| Map | MapLibre GL |
| i18n | react-i18next |
| Observability | OpenTelemetry, Prometheus, Loki, Tempo, Grafana |
| Docs | Astro + Starlight |

See the [architecture overview](apps/docs/src/content/docs/architecture/overview.md).

## Visual direction

"Folla catastral" ([D34](apps/docs/src/content/docs/adr/d34-visual-direction.md)) is a surveyor's data-sheet identity: a cool fog-grey palette, three typefaces and a cartographic hatch that draws unknown values instead of hiding them. See the [design system](apps/docs/src/content/docs/architecture/design-system.mdx).

## Documentation

The portal lives in `apps/docs` and is bilingual: English is the source of truth, Spanish lives under `/es/`. It holds the vision, features, domain, architecture and 38 ADRs (D0 to D37).

```bash
pnpm install
pnpm docs:dev
```

Public hosting on Cloudflare Pages ([D36](apps/docs/src/content/docs/adr/d36-docs-hosting-cloudflare-pages.md)) is pending [#130](https://github.com/JSisques/house-radar/issues/130).

## Environments

| Environment | Where | Access |
| --- | --- | --- |
| Local | Docker Compose | localhost |
| CI | GitHub Actions + Testcontainers | Pipeline only |
| Staging | Own server | Private (Tailscale) |
| Production | Not defined yet | When the product is published |

Details in [Environments and deployment](apps/docs/src/content/docs/operations/environments.md).

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 10.34.6 (pinned through `packageManager`; use Corepack)

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities as described in [SECURITY.md](SECURITY.md).

## License

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
