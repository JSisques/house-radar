---
title: "D16. Quality and workflow"
description: "GitHub Actions (lint, typecheck, test, and build of affected packages with Turborepo), architectural boundaries verified in CI, Conventional"
sidebar:
  order: 17
---

- **Status:** Accepted
- **Date:** 2026-11-20
- **Updated:** 2026-11-21 (dependency updates with Renovate)

## Context

The project follows real-product standards ([D0](/adr/d00-project-purpose/)) and needs a defined delivery workflow and quality gates.

## Decision

GitHub Actions (lint, typecheck, test, and build of affected packages with Turborepo), architectural boundaries verified in CI, Conventional Commits with commitlint, short feature branches with a PR to `main`, Node and pnpm versions pinned in the repository, and dependency updates proposed by Renovate as exact-pinned PRs checked by CI.

## Consequences

- Dependencies stay exact-pinned. Updates arrive as small Renovate PRs that pass commitlint and the CI checks, so no one bumps versions by hand (see [#148](https://github.com/JSisques/house-radar/issues/148)).
