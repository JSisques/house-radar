---
title: "D16. Quality and workflow"
description: "GitHub Actions (lint, typecheck, test, and build of affected packages with Turborepo), architectural boundaries verified in CI, Conventional"
sidebar:
  order: 17
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The project follows real-product standards ([D0](/adr/d00-project-purpose/)) and needs a defined delivery workflow and quality gates.

## Decision

GitHub Actions (lint, typecheck, test, and build of affected packages with Turborepo), architectural boundaries verified in CI, Conventional Commits with commitlint, short feature branches with a PR to `main`, and Node and pnpm versions pinned in the repository.

## Consequences

- The decision log records no separate consequences for this decision beyond the decision itself.
