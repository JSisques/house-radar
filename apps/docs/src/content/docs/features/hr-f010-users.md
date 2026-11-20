---
title: "HR-F010: Users and settings"
description: "User accounts and settings. Simplifiable for the first release."
sidebar:
  order: 10
---

- **Priority:** P1
- **Source section:** 10
- **Responsible module:** To be defined

User accounts and settings. Simplifiable for the first release.

## Requirements

- [ ] Registration and login.
- [ ] Profile management.
- [ ] Basic preferences settings.
- [ ] Favorites management.
- [ ] Saved searches management.
- [ ] Time zone and display preferences.
- [ ] Data source configuration.
- [ ] Basic status panel of the collection processes.

## Notes

- For a strictly personal first installation, one can start with a single user and postpone public registration.
- Decision [D13](/adr/d13-users-and-authentication/): own authentication in NestJS (`identity` bounded context), registration disabled, and a single account created through a seed; passwords hashed with argon2.
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
