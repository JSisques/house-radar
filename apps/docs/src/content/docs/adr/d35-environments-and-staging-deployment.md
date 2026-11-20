---
title: "D35. Environments and staging deployment"
description: "Local, CI, a disposable staging reachable only through Tailscale and an undefined production; images in GHCR, automatic deploy on merge, secrets in GitHub Environments and per-service health checks with rollback."
sidebar:
  order: 36
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Deployment is on an own server with Docker Compose ([D8](/adr/d08-deployment/)) and the product is versioned as a single unit ([D33](/adr/d33-versioning-and-releases/)). Before starting M4 it is necessary to define which environments exist, how the application reaches them, how secrets are managed and how a deployment is verified and undone. Production is not defined yet: the product is a personal tool until it is published ([D0](/adr/d00-project-purpose/)).

## Decision

### Environments

| Environment | Where | Access | From |
| --- | --- | --- | --- |
| Local | Developer machine, Docker Compose | localhost | M0 |
| CI | GitHub Actions + Testcontainers | Pipeline only | M0 |
| Staging | Own server | Private network (Tailscale) | M4 |
| Production | To be defined (public hosting) | Internet, domain and TLS | When the product is published |

Staging is exposed only inside the Tailscale private network: the server has no public ports.

### Staging is disposable

Staging data can be wiped and regenerated; it is not where the real price history accumulates. Real data starts with production. Consequently, destructive migrations are acceptable in staging and never in production, and backups are a production requirement, not a staging one.

### Images and automatic deployment

- Images are built in GitHub Actions and pushed to GitHub Container Registry (GHCR), tagged with the commit SHA and, on releases, with the product version ([D33](/adr/d33-versioning-and-releases/)).
- Every merge to `main` deploys to staging automatically. The workflow joins the tailnet with the official Tailscale GitHub Action using an ephemeral, tagged auth key restricted by ACL to the staging server, connects over SSH with a restricted deploy key and runs `docker compose pull && docker compose up -d` with the new SHA.
- Versioned releases are reserved for production.

### Secrets

- A `staging` GitHub Environment holds the application secrets (Postgres password, seed account credentials, session secret and, later, the idealista key) and the deployment secrets (Tailscale ephemeral auth key, SSH deploy key, server host).
- On each deploy the workflow writes the server's `.env` (mode `600`) from those secrets and starts the stack. GitHub is the single source of truth: changing a secret means editing it there and redeploying, and recreating the server is a redeploy.
- Production will be a separate `production` environment with its own secrets and required reviewers.
- `.env.example` in the repository documents every variable without values.

### Deployment flow, health checks and rollback

1. **Migrations first**, in an ephemeral container with the new image. If they fail, the deploy stops and the previous version keeps running.
2. **Per-service health checks.** Every service declares its own Docker Compose healthcheck and the deploy runs `docker compose up -d --wait`. Compose waits until every blocking service is `healthy`; a timeout fails the command and triggers the rollback. The same healthchecks work locally.

| Service | Check | Blocks the deploy |
| --- | --- | --- |
| `postgres` | `pg_isready` and PostGIS extension available | Yes |
| `redis` | `PING` | Yes |
| `api` | `/health` (terminus): Postgres, Redis, migrations up to date | Yes |
| `ingestion` | Own `/health`: Redis and BullMQ worker connections | Yes |
| Outbox relay | Own `/health`: can read the outbox and publish to BullMQ | Yes |
| `web` | Serves `index.html` and exposes the deployed version (`/version.json` with the SHA) | Yes |
| Observability (Grafana, Prometheus, Loki, Tempo, OTel Collector) | Readiness endpoints | No, warning only |

3. **End-to-end smoke test.** One request through the web to the API confirms that the served SHA is the new one: the pieces are connected, not only alive.
4. **Rollback.** The server keeps the SHA of the last healthy version. If the new one fails, the workflow redeploys it and finishes red, so GitHub notifies that the merge broke staging.
5. **Concurrency.** An Actions `concurrency` group per environment makes consecutive merges deploy one after another, never overlapping.

Observability does not block the deploy: a slow Grafana must not roll back a healthy application. The workflow reports it as a warning and the alerts of [D15](/adr/d15-observability/) cover the rest.

### Production

Production hosting, deployment, secrets and backups are not defined now. They will be designed when the product is published.

## Consequences

- The application runs in a real environment from M4 without exposing anything to the internet.
- Every merge reaching staging gives fast feedback, and a failed deploy returns to the last healthy version.
- Staging can be recreated at any time from GitHub, so the server holds no unique state.
- Health checks of every service double as local checks and as the deploy gate.
- Backups (#101) leave M4 and become part of the future production work.
- Adds a deploy workflow, per-service healthcheck endpoints and an `.env.example` to the repository.
- The merge-to-deploy coupling means a broken `main` breaks staging until fixed.

## Alternatives considered

- **Public internet with a domain, or Cloudflare Tunnel, for staging:** exposes a server that holds no real data and requires a domain or a third-party tunnel now. Discarded in favour of the private Tailscale network.
- **Staging with real data:** forces backups, careful migrations and production-grade operations before the product is published. Discarded.
- **Deploy only on releases or manually:** slower feedback and a manual step that drifts from `main`. Discarded; releases are reserved for production.
- **`.env` only on the server:** not versioned or documented and lost with the server. Discarded.
- **SOPS + age:** extra tool and key management, too much ceremony for a disposable staging. Discarded.
- **API-only health checks:** a healthy API says nothing about the worker, the relay or the web. Discarded in favour of per-service checks.
