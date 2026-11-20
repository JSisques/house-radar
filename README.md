# House Radar

House Radar is a real estate discovery and analysis platform. It centralizes listings from different sources, normalizes their data, and lets you search, compare, and track properties from a single application. The initial scope is Galicia, starting with the Santiago de Compostela area.

The project is docs-first: product and technical decisions are documented in the portal before application code is written.

## Monorepo layout

```text
house-radar/
├── apps/
│   ├── api/          # Backend API (planned)
│   ├── web/          # Frontend: search, property details, map, dashboard (planned)
│   ├── ingestion/    # Collection workers and connectors (planned)
│   └── docs/         # Documentation portal (Astro + Starlight)
├── packages/
│   └── domain/       # Shared normalized model (planned)
└── infra/            # Docker Compose and deployment configuration (planned)
```

Only `apps/docs` exists today.

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 10.34.6 (pinned through `packageManager`; use Corepack)

## Documentation portal

```bash
pnpm install
pnpm docs:dev     # local dev server
pnpm docs:build   # production build
pnpm docs:check   # type and content checks
```

The portal is bilingual. English is the default locale and source of truth; Spanish lives under `/es/`. The original Spanish product draft is kept in `apps/docs/reference/`.
