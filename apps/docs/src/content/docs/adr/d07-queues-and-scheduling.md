---
title: "D7. Queues and scheduling"
description: "BullMQ + Redis (`@nestjs/bullmq`) for running ingestion."
sidebar:
  order: 8
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

Ingestion runs periodically and must handle temporary errors.

## Decision

BullMQ + Redis (`@nestjs/bullmq`) for running ingestion.

## Consequences

- Periodic execution through repeatable jobs.
- Automatic retries with backoff on temporary errors.
- The state of pending, failed, and completed jobs can be consulted through Bull Board, which covers part of section 12 (administration and observability).
- Redis is added as a service in Docker Compose.
