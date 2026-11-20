---
title: "D33. Versioning and releases"
description: "A single product version for the whole monorepo, managed by release-please with a Release PR, 0.x until Release 1.0, and Docker images tagged with version and commit SHA."
sidebar:
  order: 34
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

House Radar is a monorepo ([D2](/adr/d02-repository-strategy/)) with `api`, `web`, `ingestion` and `docs` applications and two internal packages. Commits follow Conventional Commits, enforced with commitlint ([D16](/adr/d16-quality-and-workflow/)). The whole product is deployed as one Docker Compose stack ([D8](/adr/d08-deployment/)): there are no independent deployments and nothing is published to npm. A versioning model and a release process are needed so that the server deploys an exact version and can roll back.

## Decision

- **One product version** for the whole monorepo: `api`, `web`, `ingestion` and `docs` are released together under a single SemVer number and tag (for example `v1.4.0`). The internal packages (`building-blocks`, `shared-kernel`) are `private` and follow the product version.
- **release-please** (GitHub Action) with a single root package. On every merge to `main` it maintains a Release PR that accumulates the changelog and the next version computed from Conventional Commits: `fix` bumps the patch, `feat` the minor, and a breaking change the major.
- Merging the Release PR creates the tag and the GitHub Release and updates `CHANGELOG.md`. Version and changelog are automatic; publishing is a human decision.
- **`0.x` versions until M6.** Before 1.0, breaking changes bump the minor (`bump-minor-pre-major`). `1.0.0` coincides with Release 1.0.
- **Docker images are tagged with the product version and the commit SHA**, so the server deploys an exact version and can roll back.
- Versioning and releases belong to the M0 · Foundation milestone.

## Consequences

- A single number identifies what runs in production, and one tag maps to one deployable stack.
- The version and the changelog are derived from commit messages, which reinforces the Conventional Commits discipline of D16.
- A release needs a human to merge the Release PR; nothing is published automatically on every push.
- All applications share a version even when only one of them changed.
- If an internal package is ever published to npm, it can switch to an independent version without affecting the rest.
- Adds a release-please workflow and its configuration to the repository.

## Alternatives considered

- **Independent versions per app and package:** adds cross-version compatibility overhead without independent deployments or npm publishing to justify it. Discarded.
- **semantic-release:** publishes on every qualifying push, with no human gate. Discarded.
- **Changesets:** requires per-PR changeset files, is oriented to npm publishing and is redundant with Conventional Commits. Discarded.
