# Feature: environments

## Objective

Define environments, deployment, secrets and backups before M4, so issues #100 (deployment) and #101 (backups) and the related M0 slices can start without open questions. Publish the result as ADR(s) and an operations page (en + es), and update the affected issues.

## Decisions (user-approved)

### E1. Environments (2026-11-20)

| Environment | Where | Access | From |
|---|---|---|---|
| Local | Developer machine, Docker Compose | localhost | M0 |
| CI | GitHub Actions + Testcontainers | Pipeline only | M0 |
| Staging | Own server | Private network (Tailscale) | M4 (#100) |
| Production | To be defined (public hosting) | Internet, domain + TLS | When the product is published (D0) |

- Staging is exposed only inside the Tailscale private network: no public ports on the server.
- Production is not defined yet; it will be designed when the product is published.

### E2. Staging is disposable (2026-11-20)

- Staging data is disposable (user decision): it can be wiped and regenerated; it is not where the real price history accumulates. Real data starts with production.
- Consequences:
  - The rationale of R6 changes: the M4 deployment (#100) targets staging, to run the app in a real environment; real history accumulation starts with production.
  - Backups (#101) no longer apply to staging; they become a production requirement, to be designed with production.
  - Staging migrations may reset data; destructive migrations are acceptable in staging, never in production.

### E3. Deployment to staging (2026-11-20)

- Images are built in GitHub Actions and pushed to GitHub Container Registry (GHCR), tagged with the commit SHA (and the product version on releases, D33). This resolves the registry question of the Docker images slice (#41).
- Every merge to `main` deploys to staging automatically (user decision): the workflow joins the tailnet with the official Tailscale GitHub Action using an ephemeral, tagged auth key restricted by ACL to the staging server, connects over SSH with a restricted deploy key, and runs `docker compose pull && docker compose up -d` with the new SHA.
- Versioned releases (release-please) are reserved for production.

### E4. Secrets (2026-11-20)

- GitHub Environments (user decision): a `staging` environment in the repository holds the application secrets (Postgres password, seed account credentials, session secret, later the idealista key) and the deployment secrets (Tailscale ephemeral auth key, SSH deploy key, server host). On each deploy the workflow writes the server's `.env` (mode `600`) from those secrets and starts the stack.
- Single source of truth: changing a secret means editing it in GitHub and redeploying. Recreating the staging server is a redeploy.
- Production will be a separate `production` environment with its own secrets and required reviewers.
- `.env.example` in the repository documents every variable without values.
- Rejected: `.env` only on the server (not versioned or documented, lost with the server); SOPS + age (extra tool and key management, too much ceremony for a disposable staging).

### E5. Deployment flow, health checks and rollback (2026-11-20)

1. Migrations first, in an ephemeral container with the new image (MikroORM). If they fail, the deploy stops and the previous version keeps running. Destructive migrations are allowed in staging (E2), never in production.
2. Every service declares its own Docker Compose healthcheck and the deploy runs `docker compose up -d --wait`: Compose waits until all blocking services are `healthy`; a timeout fails the command and triggers the rollback. The same healthchecks work locally.

| Service | Check | Blocks the deploy |
|---|---|---|
| `postgres` | `pg_isready` + PostGIS extension available | Yes |
| `redis` | `PING` | Yes |
| `api` | `/health` (terminus): Postgres, Redis, migrations up to date | Yes |
| `ingestion` | own `/health`: Redis and BullMQ worker connections | Yes |
| outbox relay | own `/health`: can read the outbox and publish to BullMQ | Yes |
| `web` | serves `index.html` and exposes the deployed version (`/version.json` with the SHA) | Yes |
| Observability (Grafana, Prometheus, Loki, Tempo, OTel Collector) | readiness endpoints | No — warning only |

3. End-to-end smoke test: one request through the web to the API confirming the served SHA is the new one (pieces are connected, not only alive).
4. Rollback: the server keeps the SHA of the last healthy version; if the new one fails, the workflow redeploys it and finishes red, so GitHub notifies that the merge broke staging.
5. Concurrency: Actions `concurrency` group per environment; consecutive merges deploy one after another, never overlapping.

- Observability does not block: a slow Grafana must not roll back a healthy app (false positive); the workflow reports it as a warning and D15 alerts cover the rest.
- Health checks were extended from API-only to every service at the user's request.

### E6. Docs portal hosting (2026-11-20)

- The docs portal is public and hosted on Cloudflare Pages (user decision), served at the root of `<project>.pages.dev` (project name confirmed when the Cloudflare project is created; a custom domain can be added later without changes).
- Every merge to `main` publishes the portal; every pull request gets a preview deployment, so docs changes are reviewed published.
- Once the URL exists, it is set as Astro `site` (removes the sitemap warning) and as the repository homepage.
- Reason: the content has 858 root-absolute internal links; GitHub Pages under `jsisques.github.io/house-radar/` would require `base: '/house-radar'`, which Starlight applies to its navigation but not to content links. Cloudflare Pages serves at the root without buying a domain and adds PR previews.
- Rejected: GitHub Pages under a subpath (858 links would break); GitHub Pages with a custom domain (requires buying a domain now).

### E7. Production stays undefined (2026-11-20)

- Production hosting, deployment, secrets (`production` GitHub Environment) and backups are not defined now (user decision). They will be designed when the product is published (D0). Backups (#101) move out of M4 to that future work.

## Pending discovery

- None. Next: output (ADRs, operations page, roadmap and issue updates).
- Output: ADR(s), operations page, issue updates (#100, #101, #41).

## Tasks (output)

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | ADR D35 environments, staging deployment and secrets (E1–E5, E7) and ADR D36 docs hosting on Cloudflare Pages (E6), en + es, ADR index | delegated (writer trigger: 2+ files) | [x] | `fa9dd2a` |
| T2 | Page `operations/environments` (en + es): environments table, staging deploy flow with health checks and rollback, secrets, docs hosting, production pending; link from `operations/overview` and `product/roadmap`; update roadmap page and `odd/tasks/roadmap.md` (R7: M4 deploy targets disposable staging, backups out of M4) | delegated | [x] | `de90cf8` |
| T3 | GitHub issue updates (user-confirmed): #100 retitled to staging deployment with E3–E5 criteria, "Needs definition" removed; #101 retitled to production backups, removed from M4, marked post-publication; #41 GHCR registry; new M0 slice for the docs portal on Cloudflare Pages with PR previews | inline (gh) | [ ] | |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`.

## Progress

- [x] T1: ADR D35 and D36 (en + es, index D0–D36): `fa9dd2a` (`docs: add adrs d35-d36 environments and docs hosting`).
- [x] T2: `operations/environments` (en + es), linked from `operations/overview` and `product/roadmap`; roadmap M4 rationale updated; R7 appended to `odd/tasks/roadmap.md`: `de90cf8` (`docs: add environments operations page and update roadmap`).
- [ ] T3: GitHub issue updates (pending, parent).
- Checks observed: `pnpm docs:test`, `docs:check-i18n` (70 pages x 1 locale), `docs:check` (0 errors) and `docs:build` (141 pages) all passed.
