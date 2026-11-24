---
title: "Releases"
description: "How to cut a release in House Radar using release-please."
sidebar:
  order: 6
---

## Overview

House Radar uses a single SemVer product version for the whole monorepo, managed by [release-please](https://github.com/googleapis/release-please). Version bumps and changelog entries are **automatic**; publishing is a **human decision**.

## How it works

1. Developers write [Conventional Commits](/adr/d16-quality-and-workflow/) on feature branches.
2. When a `feat` or `fix` commit (or a breaking change) is merged to `main`, the [release-please workflow](https://github.com/JSisques/house-radar/blob/main/.github/workflows/release-please.yml) (`.github/workflows/release-please.yml`) runs.
3. release-please opens a **Release PR** that accumulates all changelog entries since the last release and proposes the next version bump.
4. A maintainer reviews and **merges the Release PR**. This creates the `vX.Y.Z` tag, the GitHub Release, and updates `CHANGELOG.md`.

### Version bump rules

| Commit type | Bump |
|---|---|
| `fix:` | patch (`0.0.x` → `0.0.(x+1)`) |
| `feat:` | minor (`0.x.0` → `0.(x+1).0`) |
| Breaking change (`BREAKING CHANGE:` or `!`) | major (until `1.0.0`), then major |

Before `1.0.0` (M0–M6), breaking changes bump the **minor** version, not the major. This is controlled by `"bump-minor-pre-major": true` in [`release-please-config.json`](https://github.com/JSisques/house-radar/blob/main/release-please-config.json).

## Cutting a release

1. **Verify the Release PR.** Open the latest release-please PR and check:
   - The version bump is correct for the changes accumulated.
   - The changelog entries are accurate and readable.
   - All tests in the CI pipeline pass.
2. **Merge the Release PR** to `main`.
3. **Verify the tag and release.** After merge:
   - A `vX.Y.Z` tag exists on the merge commit.
   - A GitHub Release is created with the changelog as the release notes.
   - `CHANGELOG.md` is updated with the new version header.
4. **Deploy** the tagged version to staging/production as usual.

## Configuration

| File | Purpose |
|---|---|
| [`release-please-config.json`](https://github.com/JSisques/house-radar/blob/main/release-please-config.json) | Release-please configuration: single root package, `bump-minor-pre-major`, changelog path. |
| [`.release-please-manifest.json`](https://github.com/JSisques/house-radar/blob/main/.release-please-manifest.json) | Current product version (initially `0.0.0`). |
| [`.github/workflows/release-please.yml`](https://github.com/JSisques/house-radar/blob/main/.github/workflows/release-please.yml) | GitHub Actions workflow that triggers on pushes to `main`. |
| [`CHANGELOG.md`](https://github.com/JSisques/house-radar/blob/main/CHANGELOG.md) | Human-readable changelog, maintained automatically by release-please. |

## Requirements

A GitHub token with `contents: write` and `pull-requests: write` permissions is needed. Store it as the `RELEASE_PLEASE_TOKEN` repository secret.

## FAQ

**Q: Can I skip a version bump?**
A: No. release-please computes the bump automatically from Conventional Commits. If you don't want a bump, don't merge a `feat:`, `fix:`, or breaking change until you're ready.

**Q: What happens if I merge a `docs:` or `chore:` commit to main?**
A: release-please ignores these commit types. Nothing happens.

**Q: Can I release more than one product version?**
A: Not yet. House Radar uses a single version for the whole monorepo. Internal packages (`building-blocks`, `shared-kernel`) follow the product version. If an internal package is ever published to npm independently, it can switch to an independent version later.
