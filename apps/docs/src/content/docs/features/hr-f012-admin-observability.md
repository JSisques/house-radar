---
title: "HR-F012: Administration and observability"
description: "House Radar depends on automatic processes that can fail. It must be possible to check their status and diagnose problems."
sidebar:
  order: 12
---

## Summary

House Radar depends on automatic processes that can fail. This feature makes it possible to check their status and diagnose problems, through the observability stack and an administration area. Per [D15](/adr/d15-observability/), logs, metrics, health checks, and alerts are P1; the administration screens for connectors and advanced retries are P2.

## Priority

P1/P2 (source section 12):

- **P1:** structured logs, performance metrics, service health checks, alerts, and the job dashboard (Bull Board).
- **P2:** administration screens for connector status, runs, errors, pending jobs, retries, source enabling, and ingestion statistics.

## Responsible modules

- `apps/ingestion`: jobs, connectors, run metrics, and telemetry ([D7](/adr/d07-queues-and-scheduling/), [D15](/adr/d15-observability/)).
- `apps/api`, bounded context `ingestion`: run records, source settings, administration endpoints; `identity` protects access.
- `apps/web`: administration area (P2).
- `infra`: OpenTelemetry Collector, Prometheus, Loki, Tempo, Grafana, and Bull Board in Docker Compose ([D8](/adr/d08-deployment/)).

## Dependencies

- [HR-F001](/features/hr-f001-ingestion/): runs, errors, retries, and sources being observed.
- [HR-F010](/features/hr-f010-users/): authenticated access to the administration area.
- [HR-F005](/features/hr-f005-duplicates/) and [HR-F008](/features/hr-f008-price-history/): configurable thresholds that administration may expose.
- ADRs: [D7](/adr/d07-queues-and-scheduling/), [D8](/adr/d08-deployment/), [D10](/adr/d10-cross-cutting-architecture/), [D13](/adr/d13-users-and-authentication/), [D15](/adr/d15-observability/), [D20](/adr/d20-listing-consolidation-rules/).

See also the [Operations overview](/operations/overview/).

## User stories

- As the administrator, I want to see whether each connector works and when it last ran, so that I notice failures early.
- As the administrator, I want to read errors and retry failed runs, so that I can recover without touching the server.
- As the administrator, I want logs, metrics, and health checks, so that I can diagnose problems.

## Business rules

- **HR-F012-BR1 (P1):** services write structured logs with Pino, correlated with traces, and send them to Loki through the OpenTelemetry Collector ([D15](/adr/d15-observability/)).
- **HR-F012-BR2 (P1):** services expose performance metrics, including runs, durations, errors, and queue depth, collected into Prometheus and visualized in Grafana.
- **HR-F012-BR3 (P1):** `apps/api` and `apps/ingestion` expose health checks with `@nestjs/terminus` that report the state of their dependencies (PostgreSQL and Redis).
- **HR-F012-BR4 (P1):** alerts are defined in Grafana for service failures and failed runs.
- **HR-F012-BR5 (P1):** pending, running, and failed jobs can be inspected in Bull Board ([D7](/adr/d07-queues-and-scheduling/)).
- **HR-F012-BR6 (P2):** the administration area shows each connector's status, its latest runs with outcome and counts, the processed listings, and the extraction errors.
- **HR-F012-BR7 (P2):** the administrator can retry a failed run and can see pending jobs.
- **HR-F012-BR8 (P2):** the administrator can enable and disable sources. A source cannot be enabled until its terms of use have been reviewed ([HR-F001](/features/hr-f001-ingestion/)).
- **HR-F012-BR9 (P2):** the administration area shows ingestion statistics per source: runs, listings discovered, updated, failed, and error rate.
- **HR-F012-BR10:** administration and the Bull Board are only reachable by an authenticated user ([D13](/adr/d13-users-and-authentication/)).
- **HR-F012-BR11:** logs and metrics never contain passwords, tokens, or other secrets.
- **HR-F012-BR12:** observability tooling is accessed through adapters, so it can be replaced without changing application code ([D10](/adr/d10-cross-cutting-architecture/)).
- **HR-F012-BR13 (P2):** the administration area shows the effective values of operational settings, such as the number of runs without sighting that marks a listing as disappeared (default 3) ([D20](/adr/d20-listing-consolidation-rules/)).

## Acceptance criteria

- **HR-F012-AC1 (P1):** Given a request handled by the API, When it is processed, Then a structured log entry is written with a trace identifier.
- **HR-F012-AC2 (P1):** Given a completed run, When metrics are scraped, Then they include the run, its duration, and its outcome.
- **HR-F012-AC3 (P1):** Given PostgreSQL unreachable, When the health check is called, Then it reports the service as unhealthy.
- **HR-F012-AC4 (P1):** Given all dependencies reachable, When the health check is called, Then it reports healthy.
- **HR-F012-AC5 (P1):** Given a run that failed, When alert rules are evaluated, Then an alert is raised in Grafana.
- **HR-F012-AC6 (P1):** Given an unauthenticated visitor, When they request the Bull Board, Then access is denied.
- **HR-F012-AC7 (P2):** Given several connectors, When the administrator opens the administration area, Then each shows its status and its latest run.
- **HR-F012-AC8 (P2):** Given a failed run, When the administrator selects retry, Then a new run is queued and linked to the failed one.
- **HR-F012-AC9 (P2):** Given a source without reviewed terms, When the administrator tries to enable it, Then it remains disabled and the reason is shown.
- **HR-F012-AC10 (P2):** Given an enabled source, When the administrator disables it, Then no scheduled run starts for it.
- **HR-F012-AC11 (P2):** Given extraction errors, When the administrator opens the errors view, Then each error shows its source, time, and cause.
- **HR-F012-AC12:** Given a login request with a password, When the logs are inspected, Then the password does not appear.

## Edge cases

- A run in progress when its source is disabled: it completes and no further run is scheduled.
- The observability stack is down: applications keep working and telemetry loss is accepted, with the problem visible in health checks.
- A retry of a run that already succeeded: rejected.
- A very high error rate for one source does not stop other sources.
- The queue is empty: the administration area shows an empty state, not an error.

## Out of scope (MVP)

- Administration screens (P2) are not required for the first release; Bull Board and the observability stack cover it.
- Multiple administrator roles and per-source permissions.
- Capacity planning and automatic scaling.

## Open questions

- Is any authenticated user an administrator, or is there a distinct administrator role?
- Where are operational settings (disappearance threshold, duplicate thresholds) edited: deployment configuration or the administration area?
- Which alerts are defined for the first release besides service failures and failed runs?

## Related decisions

[D7](/adr/d07-queues-and-scheduling/), [D8](/adr/d08-deployment/), [D10](/adr/d10-cross-cutting-architecture/), [D13](/adr/d13-users-and-authentication/), [D15](/adr/d15-observability/), [D20](/adr/d20-listing-consolidation-rules/).
