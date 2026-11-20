# Contributing to House Radar

House Radar is a real estate discovery and analysis platform for Galicia, starting with the Santiago de Compostela area. It is a personal tool built to real-product standards. Contributions are welcome; please read this guide first.

## Docs-first workflow

Product and technical decisions are written down before application code.

- Decisions are ADRs in the documentation portal (`apps/docs/src/content/docs/adr/`, D0 to D37 so far).
- Each substantial feature has a feature document in `odd/tasks/` with its task list, checks and commit evidence.
- If your change alters a decision, update or add the ADR in the same pull request.

## Issues and planning

- One issue per vertical slice: a deliverable piece of work with its own acceptance criteria (`HR-FNNN-ACn`).
- Each feature (`HR-F001` to `HR-F012`) is a parent issue; its slices are linked sub-issues.
- Work is ordered in milestones M0 to M6 (see the [roadmap](apps/docs/src/content/docs/product/roadmap.md)).
- Flow is tracked on the [project board](https://github.com/users/JSisques/projects/16).
- Open an issue and agree on the slice before starting non-trivial work.

## Branches

Short-lived branches from `main`, named by type:

- `feat/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `chore/<short-name>`

## Test-driven development

TDD is strict ([D14](apps/docs/src/content/docs/adr/d14-testing.md)): write a failing test (RED), make it pass with the simplest code (GREEN), then refactor. Tests and docs ship in the same pull request as the behavior they cover.

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint ([D16](apps/docs/src/content/docs/adr/d16-quality-and-workflow.md)).
- Do not add AI attribution or `Co-Authored-By` lines for AI tools to commits.

## Pull requests

- One reviewable pull request per slice. About 400 authored changed lines is a planning guideline, not a hard cap; split into chained pull requests when a change is clearly larger.
- Link the issue, fill in the pull request template, and keep `main` green.

## Code conventions

Structure, layering, naming, testing and tooling rules live in [Code conventions](apps/docs/src/content/docs/architecture/conventions.md). Two agent skills encode them and are registered in [`AGENTS.md`](AGENTS.md):

- `.claude/skills/house-radar-backend/SKILL.md` for `apps/api`, `apps/ingestion` and the shared packages.
- `.claude/skills/house-radar-frontend/SKILL.md` for `apps/web`.

## Documentation and languages

The portal is bilingual. English is the source of truth; Spanish translations live under `apps/docs/src/content/docs/es/` and must mirror the English files. Parity is checked by `pnpm docs:check-i18n`. Write code, comments and other artifacts in English.

## Local setup

Requirements: Node.js 24 (see `.nvmrc`) and pnpm 10.34.6 through Corepack.

```bash
pnpm install
pnpm docs:dev         # documentation portal dev server
pnpm docs:test        # docs unit tests
pnpm docs:check-i18n  # en/es parity
pnpm docs:check       # Astro type and content checks
pnpm docs:build       # production build of the portal
```

Only the documentation portal exists today. Commands for the apps (`api`, `web`, `ingestion`) arrive with milestone M0.

## Data sources

Respect source terms (product principle 7, [D37](apps/docs/src/content/docs/adr/d37-fotocasa-detail-connector.md)). Do not contribute code that scrapes portals without authorization, and never bypass technical protections. Ingestion relies on APIs, feeds, permissions or other authorized methods; reading individual listing pages is limited to what D37 allows.

## License

House Radar is licensed under [AGPL-3.0](LICENSE). By contributing, you agree that your contributions are licensed under the same terms (inbound = outbound).

## Conduct and security

Be kind: see the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately as described in the [Security Policy](SECURITY.md).
