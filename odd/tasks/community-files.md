# Feature: community-files

## Objective

Add the standard repository files (license, contributing guide, code of conduct, security policy, issue and PR templates, CodeQL workflow) and rewrite the README with everything defined so far.

## Decisions (user-approved 2026-11-20)

- License: **AGPL-3.0** (SPDX `AGPL-3.0-only` in `package.json` files). Open source for the portfolio and contributions; anyone offering a modified version as a network service must publish its source, protecting a future product (D0); the author can still license commercially.
- CodeQL workflow is required (JavaScript/TypeScript and GitHub Actions).
- `CHANGELOG.md` is not written by hand: release-please generates it (D33).
- Security reports go through GitHub private vulnerability reporting; no personal email in public files.

## Tasks

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | `LICENSE` (official AGPL-3.0 text from the GitHub licenses API) + `license` field in package.json files | inline | [x] | e0e3065 |
| T2 | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`, `.github/workflows/codeql.yml` | delegated (writer trigger: 2+ files) | [x] | 33b5f6d |
| T3 | README rewrite | delegated | [x] | 460c808 |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`; YAML of workflows and issue forms parses; CodeQL workflow runs green on the PR.
