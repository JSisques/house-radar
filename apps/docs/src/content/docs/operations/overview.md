---
title: Operations overview
description: Deployment, observability, and alerts. Sections without source content are marked as to be defined.
sidebar:
  order: 1
---

## Deployment

Decision [D8](/adr/d08-deployment/): own server with Docker Compose. Deployment is platform-agnostic: the same Compose setup must be movable to a VPS without changes.

Services in the Compose setup: PostgreSQL + PostGIS, Redis, OpenTelemetry Collector, Prometheus, Loki, Tempo, and Grafana (see the [architecture overview](/architecture/overview/)).

Environments, the staging deployment procedure and secrets are described in [Environments and deployment](/operations/environments/) ([D35](/adr/d35-environments-and-staging-deployment/)). Production is not defined yet.

## Observability

Decision [D15](/adr/d15-observability/): full stack from the MVP.

- OpenTelemetry (Collector) to Prometheus (metrics), Loki (logs), and Tempo (traces).
- Grafana for dashboards and alerts.
- Structured logs with Pino.
- Health checks with `@nestjs/terminus`.
- Bull Board for job status.

Instrumentation uses OpenTelemetry behind an adapter, so the backends are interchangeable.

## Alerts

Grafana alerts, as a minimum, for:

- Ingestion without successful runs within a configurable period.
- Extraction error rate.
- Failing health checks.

Thresholds and notification channels: **To be defined.**

## Ingestion runbooks

**To be defined.**

## Releases

House Radar uses a single SemVer product version managed by [release-please](https://github.com/googleapis/release-please). The release process is described in [Releases](/operations/releases/) ([ADR D33](/adr/d33-versioning-and-releases/)).

## Backups and recovery

A production requirement, defined together with production. Staging data is disposable and is not backed up ([D35](/adr/d35-environments-and-staging-deployment/)).
