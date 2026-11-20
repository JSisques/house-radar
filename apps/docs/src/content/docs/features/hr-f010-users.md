---
title: "HR-F010: Users and settings"
description: "User accounts and settings. Simplifiable for the first release."
sidebar:
  order: 10
---

## Summary

User accounts and settings, simplified for the first release: authentication is built into the backend, public registration is disabled, and a single account is created through a seed ([D13](/adr/d13-users-and-authentication/)). The model supports several users from the start, and everything a user owns, such as favorites and saved searches, is associated with that user.

## Priority

P1 (source section 10).

## Responsible modules

- `apps/api`, bounded context `identity`: authentication, password hashing with argon2, account seed, and the authentication port ([D10](/adr/d10-cross-cutting-architecture/)).
- `apps/api`, bounded context `users`: profile and preferences.
- `apps/web`: login, profile, and settings screens.
- `infra`: account seed execution at deployment.

## Dependencies

- [HR-F007](/features/hr-f007-favorites-saved-searches/): favorites and saved searches belong to the authenticated user.
- [HR-F012](/features/hr-f012-admin-observability/): data source configuration and the collection status panel live in the administration area.
- [HR-F011](/features/hr-f011-notifications/): notification preferences (post-MVP).
- ADRs: [D4](/adr/d04-backend-framework/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/).

## User stories

- As the owner of the installation, I want to sign in with my account, so that only I can use my House Radar.
- As a user, I want to set my time zone and display preferences, so that dates and values appear as I expect.
- As a user, I want to manage my profile and password, so that my account stays under my control.

## Business rules

- **HR-F010-BR1:** authentication is implemented in NestJS in the `identity` bounded context and exposed through a port; a different provider (OIDC or a SaaS) would be a new adapter ([D13](/adr/d13-users-and-authentication/), [D10](/adr/d10-cross-cutting-architecture/)).
- **HR-F010-BR2:** public registration is disabled. The only way to create an account in the first release is the seed.
- **HR-F010-BR3:** passwords are stored hashed with argon2 and are never stored or logged in plain text.
- **HR-F010-BR4:** the user model supports several users from the start, even though registration is disabled.
- **HR-F010-BR5:** every API operation other than login and health checks requires an authenticated user.
- **HR-F010-BR6:** favorites and saved searches are associated with a user and are not global; a user never accesses data owned by another user ([HR-F007](/features/hr-f007-favorites-saved-searches/)).
- **HR-F010-BR7:** failed login attempts return the same generic error whether the account exists or not.
- **HR-F010-BR8:** the user manages a profile and can change their password, providing the current one.
- **HR-F010-BR9:** the user can set a time zone and basic display preferences. Preferences belong to the user and are applied when the interface renders dates and values.
- **HR-F010-BR10:** the interface is Spanish only in the first release but is prepared for more languages ([D12](/adr/d12-web-internationalization/)); a language preference is not exposed until another translation exists.
- **HR-F010-BR11:** data source configuration and the collection process status panel are part of administration ([HR-F012](/features/hr-f012-admin-observability/)) and are reachable from the settings area.

## Acceptance criteria

- **HR-F010-AC1:** Given the seed has run, When the installation is started, Then exactly one account exists and can sign in.
- **HR-F010-AC2:** Given valid credentials, When the user signs in, Then they get an authenticated session and access the application.
- **HR-F010-AC3:** Given wrong credentials, When the user attempts to sign in, Then access is denied with a generic error that does not reveal whether the account exists.
- **HR-F010-AC4:** Given a request to create an account through the public interface, When it is sent, Then it is rejected because registration is disabled.
- **HR-F010-AC5:** Given an unauthenticated request to an API operation other than login or health, When it is sent, Then it is rejected as unauthorized.
- **HR-F010-AC6:** Given a stored account, When its record is inspected, Then the password is stored as an argon2 hash.
- **HR-F010-AC7:** Given two accounts created in a test, When one signs in, Then it cannot read or change the other's favorites or saved searches.
- **HR-F010-AC8:** Given an authenticated user, When they change their password with the correct current password, Then the new password works and the old one does not.
- **HR-F010-AC9:** Given an authenticated user, When they change their time zone, Then dates are displayed in that time zone.
- **HR-F010-AC10:** Given the seed already ran, When it runs again, Then no second account is created and the existing one is not overwritten.

## Edge cases

- Sign-in attempts after the session expired: the user is asked to sign in again and returns to the page they were on.
- A password change with a wrong current password: rejected, no change.
- Seed executed with missing credentials: it fails with a clear message and creates nothing.
- A time zone value that is not valid: rejected.
- Signing out: the session is invalidated.

## Out of scope (MVP)

- Public registration, invitations, and roles.
- Password recovery by email and two-factor authentication.
- Migration to OIDC or a SaaS identity provider (a future adapter).

## Open questions

- How is the seed account provisioned (deployment configuration or a command), and how are its credentials supplied?
- What is the session mechanism and its duration?
- Is there a password policy, and is there a limit or lock on repeated failed sign-ins?
- Which display preferences exist besides the time zone?

## Related decisions

[D4](/adr/d04-backend-framework/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/).
