---
title: Environments and deployment
description: Environments, the automatic staging deployment with health checks and rollback, secrets by name, docs hosting and what is still undefined for production.
sidebar:
  order: 2
---

Decisions: [D35](/adr/d35-environments-and-staging-deployment/) (environments and staging deployment) and [D36](/adr/d36-docs-hosting-cloudflare-pages/) (docs hosting).

## Environments

| Environment | Where | Access | From |
| --- | --- | --- | --- |
| Local | Developer machine, Docker Compose | localhost | M0 |
| CI | GitHub Actions + Testcontainers | Pipeline only | M0 |
| Staging | Own server | Private network (Tailscale) | M4 |
| Production | To be defined (public hosting) | Internet, domain and TLS | When the product is published |

Staging is exposed only inside the Tailscale private network: the server has no public ports. Staging data is disposable: it can be wiped and regenerated, and destructive migrations are acceptable there, never in production.

## Staging deployment

Images are built in GitHub Actions and pushed to GitHub Container Registry, tagged with the commit SHA. Every merge to `main` triggers this flow:

1. The workflow joins the tailnet with the Tailscale GitHub Action, using an ephemeral, tagged auth key restricted by ACL to the staging server.
2. It connects over SSH with a restricted deploy key and writes the server's `.env` (mode `600`) from the `staging` GitHub Environment secrets.
3. Migrations run first, in an ephemeral container with the new image. If they fail, the deploy stops and the previous version keeps running.
4. `docker compose pull && docker compose up -d --wait` starts the new SHA. Compose waits until every blocking service is `healthy`; a timeout fails the command.
5. An end-to-end smoke test sends one request through the web to the API and confirms the served SHA is the new one.
6. On any failure the workflow redeploys the last healthy SHA and finishes red.

Consecutive merges deploy one after another: an Actions `concurrency` group per environment prevents overlapping deploys.

## Health checks

Every service declares its own Docker Compose healthcheck. The same checks work locally.

| Service | Check | Blocks the deploy |
| --- | --- | --- |
| `postgres` | `pg_isready` and PostGIS extension available | Yes |
| `redis` | `PING` | Yes |
| `api` | `/health` (terminus): Postgres, Redis, migrations up to date | Yes |
| `ingestion` | Own `/health`: Redis and BullMQ worker connections | Yes |
| Outbox relay | Own `/health`: can read the outbox and publish to BullMQ | Yes |
| `web` | Serves `index.html` and exposes the deployed version (`/version.json` with the SHA) | Yes |
| Observability (Grafana, Prometheus, Loki, Tempo, OTel Collector) | Readiness endpoints | No, warning only |

Observability does not block: a slow Grafana must not roll back a healthy application. The [alerts](/operations/overview/) cover the rest.

## Rollback

The server keeps the SHA of the last healthy version. If the new version fails the migrations, the health checks or the smoke test, the workflow redeploys that SHA and finishes red, so GitHub notifies that the merge broke staging.

## Secrets

Secrets live in the `staging` GitHub Environment, the single source of truth. Changing a secret means editing it in GitHub and redeploying; recreating the server is a redeploy. `.env.example` in the repository documents every variable without values.

Application secrets:

- Postgres password.
- Seed account email and password.
- Session secret.
- idealista key (later).

Deployment secrets:

- Tailscale ephemeral auth key.
- SSH deploy key.
- Server host.

## Docs hosting

The documentation portal is public and hosted on Cloudflare Pages, served at the root of `<project>.pages.dev`. Every merge to `main` publishes it and every pull request gets a preview deployment. See [D36](/adr/d36-docs-hosting-cloudflare-pages/).

## Production

Pending. Production hosting, deployment, secrets (a separate `production` GitHub Environment with required reviewers) and backups are designed when the product is published. Releases versioned with release-please ([D33](/adr/d33-versioning-and-releases/)) are reserved for production.
