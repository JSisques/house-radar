---
title: "D15. Observability"
description: "Full stack from the MVP: OpenTelemetry (Collector) to Prometheus (metrics), Loki (logs), Tempo (traces), and Grafana (dashboards and alerts)"
sidebar:
  order: 16
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

House Radar depends on automatic processes that can fail, so their state must be checkable and problems diagnosable.

## Decision

Full stack from the MVP: OpenTelemetry (Collector) to Prometheus (metrics), Loki (logs), Tempo (traces), and Grafana (dashboards and alerts). Structured logs with Pino, health checks with `@nestjs/terminus`, and Bull Board for jobs.

## Consequences

- Instrumentation uses OpenTelemetry behind an adapter ([D10](/adr/d10-cross-cutting-architecture/)); the observability backends are interchangeable.
- Docker Compose includes OTel Collector, Prometheus, Loki, Tempo, and Grafana.
- Grafana alerts at a minimum for: ingestion without successful runs within a configurable period, extraction error rate, and failing health checks.
- Section 12 (administration and observability) becomes P1 with regard to logs, metrics, health checks, and alerts.
