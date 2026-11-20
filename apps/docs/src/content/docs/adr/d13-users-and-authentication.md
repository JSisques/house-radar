---
title: "D13. Users and authentication"
description: "Own authentication in NestJS (`identity` bounded context), registration disabled and a single account created through a seed."
sidebar:
  order: 14
---

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The first installation is strictly personal, but favorites and saved searches belong to users.

## Decision

Own authentication in NestJS (`identity` bounded context), registration disabled and a single account created through a seed.

## Consequences

- Passwords hashed with argon2.
- The user model supports several users from the start, even though public registration is disabled.
- Favorites and saved searches are associated with a user; they are not global.
- The authentication mechanism is exposed through a port ([D10](/adr/d10-cross-cutting-architecture/)): migrating to OIDC (Keycloak, Authentik) or to a SaaS means a new adapter.
