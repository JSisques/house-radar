# House Radar

Real estate discovery and analysis platform. pnpm + Turborepo monorepo: `apps/api`, `apps/ingestion` (NestJS, DDD), `apps/web` (React + Vite), `apps/docs` (Astro + Starlight), `packages/building-blocks`, `packages/shared-kernel`.

## Skills

| Skill | Path | Use when |
| --- | --- | --- |
| `house-radar-backend` | `.claude/skills/house-radar-backend/SKILL.md` | Writing code in `apps/api`, `apps/ingestion`, `packages/building-blocks`, `packages/shared-kernel` |
| `house-radar-frontend` | `.claude/skills/house-radar-frontend/SKILL.md` | Writing code in `apps/web` |

## Where to look

- Code conventions: `apps/docs/src/content/docs/architecture/conventions.md`
- Architecture decisions: `apps/docs/src/content/docs/adr/`
- Feature task documents: `odd/tasks/`

## Rules for agents

- Use Conventional Commits. Never add AI attribution or `Co-Authored-By` to commits.
- Strict TDD: write the failing test first (RED), then implement (GREEN), then refactor.
- Write code, docs and other artifacts in English. Spanish docs under `apps/docs/src/content/docs/es/` mirror the English ones.
