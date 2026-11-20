---
title: "HR-F011: Notifications and alerts"
description: "Post-first-release automation of alerts for users."
sidebar:
  order: 11
---

:::note
This feature is priority P2 and is **post-MVP**: it is specified here so the model can leave room for it, but it is not part of the first release.
:::

## Summary

Automation of alerts for users after the first release: notify new listings, price drops, and important changes, configured per saved search, with in-app notifications and email prepared behind a port.

## Priority

P2 (source section 11), after the first release.

## Responsible modules

- `apps/api`, a new bounded context `notifications` (proposed; it is not in the candidate list of [D4](/adr/d04-backend-framework/)): alert rules, notification records, and delivery through ports ([D10](/adr/d10-cross-cutting-architecture/)).
- `apps/ingestion`: scheduled evaluation of alert rules after each run, as BullMQ jobs ([D7](/adr/d07-queues-and-scheduling/)).
- `apps/web`: in-app notification center and alert settings.
- `infra`: the email adapter configuration, when email is enabled.

## Dependencies

- [HR-F007](/features/hr-f007-favorites-saved-searches/): alerts are configured per saved search and on favorites.
- [HR-F008](/features/hr-f008-price-history/): price drops and changes come from observations.
- [HR-F001](/features/hr-f001-ingestion/): new listings and runs trigger evaluation.
- [HR-F010](/features/hr-f010-users/): notifications belong to the authenticated user and use their preferences.
- ADRs: [D7](/adr/d07-queues-and-scheduling/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).

## User stories

- As a user, I want to be told when a new property matches a saved search, so that I do not have to check the search myself.
- As a user, I want to be told when a property I follow drops in price, so that I can act on it.
- As a user, I want to choose how often I am notified, so that I am not overwhelmed.

## Business rules

- **HR-F011-BR1:** alerts are configured per saved search and can be switched on or off independently.
- **HR-F011-BR2:** a "new listing" alert fires when a property starts matching the saved search since the last evaluation.
- **HR-F011-BR3:** a "price drop" alert fires when the representative price of a followed property (a favorite or a match of an alert) decreases ([D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/)).
- **HR-F011-BR4:** an "important change" alert covers changes in listings recorded in the history; which changes count as important is configurable.
- **HR-F011-BR5:** the user configures the notification frequency per alert.
- **HR-F011-BR6:** in-app notifications are available to the owning user only and can be marked as read.
- **HR-F011-BR7:** email notifications are prepared as a delivery port with no mandatory adapter; enabling an email adapter does not change the rules above ([D10](/adr/d10-cross-cutting-architecture/)).
- **HR-F011-BR8:** the same change never produces more than one notification for the same alert.
- **HR-F011-BR9:** notification text is Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).

## Acceptance criteria

- **HR-F011-AC1:** Given a saved search with a new-listing alert, When a new property matching it appears, Then an in-app notification is created for the owner.
- **HR-F011-AC2:** Given a favorite priced 200 000 €, When its representative price drops to 190 000 €, Then a price-drop notification is created showing both prices.
- **HR-F011-AC3:** Given a price that rises, When the change is recorded, Then no price-drop notification is created.
- **HR-F011-AC4:** Given an alert switched off, When matching changes occur, Then no notification is created.
- **HR-F011-AC5:** Given a configured frequency, When changes occur, Then notifications are delivered according to that frequency.
- **HR-F011-AC6:** Given a notification already created for a change, When the rules are evaluated again, Then no second notification is created for the same change.
- **HR-F011-AC7:** Given two users, When a change matches the alert of one of them, Then only that user sees the notification.
- **HR-F011-AC8:** Given an unread notification, When the user marks it as read, Then it is shown as read.
- **HR-F011-AC9:** Given the email port without an adapter, When an alert fires, Then the in-app notification is created and no error occurs.

## Edge cases

- A saved search deleted after notifications were created: existing notifications are kept and marked as originating from a deleted search.
- A property that matches, stops matching, and matches again: it is a new match and may notify again.
- Many changes in a single run: notifications are grouped according to the configured frequency.
- A favorite whose listings all disappear: a change notification can be produced, once.
- Delivery failure by email: retried according to the queue policy and never blocks in-app notifications.

## Out of scope (MVP)

- Everything in this feature is outside the first release.
- Push notifications and messaging channels other than in-app and email.
- Alerts based on prediction or recommendation ([out of scope](/product/out-of-scope/)).

## Open questions

- Which frequencies are offered (for example, immediate and periodic digest)?
- Which listing changes count as "important"?
- Should the user's own manual checks generate notifications for that same user?

## Related decisions

[D7](/adr/d07-queues-and-scheduling/), [D10](/adr/d10-cross-cutting-architecture/), [D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/), [D19](/adr/d19-search-read-model/), [D20](/adr/d20-listing-consolidation-rules/).
