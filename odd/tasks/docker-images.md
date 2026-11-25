# Feature: Docker images tagged with product version and commit SHA (issue #41, S-M0-26)

Objective: deployable images for api, web, ingestion pushed to GHCR. Branch: `feat/m0-docker-images`. Delivery: ask-on-risk. Test runner: `node --test --test-concurrency=1 'tests/workspace/*.test.mjs'` (workspace tests) plus `docker build` smoke checks.

## Specs

- S1: Multi-stage Dockerfiles for `apps/api`, `apps/web`, `apps/ingestion` (and the outbox relay process), plus a `.dockerignore`.
- S2: Per-service Docker healthchecks usable by `docker compose up --wait` (D35).
- S3: "Given a built image, When started with minimal env, Then the process boots and its healthcheck reports healthy."
- S4: "Given the web image, When `/version.json` is requested, Then it returns the commit SHA it was built from."
- S5: "Given a push to `main`, When the workflow runs, Then each image is built and pushed to GHCR tagged with the commit SHA." (tag `sha-<commit>`)
- S6: "Given release tag `v0.3.0`, When the workflow runs, Then images are tagged `0.3.0` and with the commit SHA."
- Out of scope: "Staging deployment (#100)."
- Assumption A1: the outbox relay (`apps/api/src/core/persistence/outbox/outbox-relay.ts`) has no production entry point yet; to be decided with the user before building its image.

## Tasks

- [x] T1 (S1, S3) api Dockerfile + `.dockerignore` + healthcheck — inline
- [x] T2 (S1, S3) ingestion Dockerfile + healthcheck — inline
- [x] T3 (S1, S2, S3, S4) web Dockerfile (static server) + `/version.json` + healthcheck — inline
- [x] T4 (S5, S6) GHCR publish workflow with tag rules — inline
- [ ] T5 (S1) outbox relay process image — blocked on A1
- [ ] T6 docs (EN + ES) for images/tags

## Log

- L1 (2026-11-25): "TEnemos que hacer esta issue en su propio worktree desde main (haz fetch primero) https://github.com/JSisques/house-radar/issues/41"
- L2: Explored. API health `GET /api/health` port 3000; ingestion `GET /health` port 3001; both SWC -> `dist/main.js`, ESM, Node 24, pnpm 10.34.6. Web: Vite -> `dist/`, `public/` exists. Tags have no component prefix (`v0.3.0`). No existing Dockerfile or deploy workflow.
- L3: T1-T4 verified: 9 workspace tests green; api/ingestion/web images built and reported (healthy) with minimal env; GET /version.json returned the build SHA. Full workspace suite not runnable here (worktree has no node_modules; 26 unrelated tooling failures).
- L4: User decided the relay image goes in its own M0 issue: #187. Docs added EN+ES under operations/environments (Container images).
