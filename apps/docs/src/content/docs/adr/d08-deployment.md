---
title: "D8. Deployment"
description: "Own server with Docker Compose. Platform-agnostic deployment: the same Compose setup must be movable to a VPS without changes."
sidebar:
  order: 9
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The platform needs a deployment target for the MVP.

## Decision

Own server with Docker Compose. Platform-agnostic deployment: the same Compose setup must be movable to a VPS without changes.

## Consequences

- Services such as Redis ([D7](/adr/d07-queues-and-scheduling/)) and the observability stack ([D15](/adr/d15-observability/)) run as Docker Compose services.
- No further consequences are recorded in the decision log for this decision.
