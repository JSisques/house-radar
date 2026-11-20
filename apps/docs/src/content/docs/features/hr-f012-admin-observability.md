---
title: "HR-F012: Administration and observability"
description: "House Radar depends on automatic processes that can fail. It must be possible to check their status and diagnose problems."
sidebar:
  order: 12
---

- **Priority:** P1/P2
- **Source section:** 12
- **Responsible module:** To be defined

House Radar depends on automatic processes that can fail. It must be possible to check their status and diagnose problems.

## Requirements

- [ ] View connector status.
- [ ] View latest runs.
- [ ] View processed listings.
- [ ] View extraction errors.
- [ ] View pending jobs.
- [ ] Retry failed processes.
- [ ] Enable and disable sources.
- [ ] View ingestion statistics.
- [ ] Structured logs.
- [ ] Performance metrics.
- [ ] Service health checks.

## Notes

- Per [D15](/adr/d15-observability/), this area is P1 with regard to logs, metrics, health checks, and alerts. Bull Board covers part of it ([D7](/adr/d07-queues-and-scheduling/)).
- See [Operations overview](/operations/overview/).
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
