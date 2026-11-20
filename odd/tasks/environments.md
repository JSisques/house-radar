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

## Pending discovery

- Docs portal hosting (public).
- Output: ADR(s), operations page, issue updates (#100, #101, #41).
