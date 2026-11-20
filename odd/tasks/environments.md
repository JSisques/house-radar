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

## Pending discovery

- Secrets management.
- Health check / rollback on failed staging deploy.
- Output: ADR(s), operations page, issue updates (#100, #101, #41).
