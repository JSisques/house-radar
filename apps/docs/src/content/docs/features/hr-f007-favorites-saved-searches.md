---
title: "HR-F007: Favorites and saved searches"
description: "Let users keep track of properties and searches of interest."
sidebar:
  order: 7
---

## Summary

Users mark properties as favorites and save searches with their filters, to come back to them later. Both belong to a user and are never global ([D13](/adr/d13-users-and-authentication/)).

## Priority

P1 (source section 7).

## Responsible modules

- `apps/api`, bounded context `users`: favorites and saved searches owned by a user; authentication and the current user come from the `identity` context.
- `apps/web`: favorite toggle, favorites list, and saved searches screens.
- `packages/shared-kernel`: filter and sort definitions that a saved search stores.

## Dependencies

- [HR-F010](/features/hr-f010-users/): the authenticated user that owns the data.
- [HR-F003](/features/hr-f003-search/): the filters a saved search stores and runs.
- [HR-F004](/features/hr-f004-property-detail/): the favorite toggle on the property page.
- [HR-F005](/features/hr-f005-duplicates/): merging properties affects favorites.
- [HR-F011](/features/hr-f011-notifications/): alerts per saved search (post-MVP).
- ADRs: [D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/), [D19](/adr/d19-search-read-model/).

## User stories

- As a user, I want to mark properties as favorites, so that I can find them again quickly.
- As a user, I want to save a search with its filters, so that I can repeat it without setting the filters again.
- As a user, I want to edit or delete my saved searches, so that they keep matching what I look for.

## Business rules

- **HR-F007-BR1:** favorites and saved searches belong to the user who created them. A user never sees or changes another user's favorites or searches ([D13](/adr/d13-users-and-authentication/)).
- **HR-F007-BR2:** a favorite refers to a property. Marking a property that is already a favorite changes nothing; removing a favorite does not affect the property.
- **HR-F007-BR3:** the favorites list shows the current data of each property, including its representative price and status. A favorite with no active listing remains in the list and is marked as no longer available.
- **HR-F007-BR4:** a saved search stores a name, its filters, and its sort order, including a selected map area when there is one ([HR-F003](/features/hr-f003-search/)).
- **HR-F007-BR5:** saved searches can be edited (name, filters, sort order) and deleted. Editing or deleting one never affects favorites or other saved searches.
- **HR-F007-BR6:** viewing a saved search runs it with the current data; results are never stored, so they always reflect the current state of the properties.
- **HR-F007-BR7:** when two properties are linked as the same property ([HR-F005](/features/hr-f005-duplicates/)), a favorite of either remains a favorite of the surviving property, without duplicates.
- **HR-F007-BR8:** the interface text is Spanish-first and translatable ([D12](/adr/d12-web-internationalization/)).
- **HR-F007-BR9:** saved search names are unique per user.

## Acceptance criteria

- **HR-F007-AC1:** Given an authenticated user on a property page, When they mark it as favorite, Then it appears in their favorites list.
- **HR-F007-AC2:** Given a favorite, When the user removes it, Then it no longer appears in their favorites list and the property is not affected.
- **HR-F007-AC3:** Given a property already marked as favorite, When the user marks it again, Then there is still one favorite.
- **HR-F007-AC4:** Given two users, When one marks a favorite, Then the other user's list does not change.
- **HR-F007-AC5:** Given a favorite whose listings have all disappeared, When the user opens the list, Then the favorite is shown as no longer available.
- **HR-F007-AC6:** Given a search with active filters, When the user saves it with a name, Then it appears in their saved searches with those filters and sort order.
- **HR-F007-AC7:** Given a saved search, When the user edits its filters and saves, Then the saved search stores the new filters.
- **HR-F007-AC8:** Given a saved search, When the user deletes it, Then it no longer appears and favorites are unaffected.
- **HR-F007-AC9:** Given a saved search, When the user opens it after new listings arrived, Then the results include properties that now match.
- **HR-F007-AC10:** Given a user who favorited both properties that are later linked as one, When the link is made, Then they have one favorite for the surviving property.
- **HR-F007-AC11:** Given an unauthenticated visitor, When they request favorites or saved searches, Then access is denied.
- **HR-F007-AC12:** Given a user with a saved search named "Madrid flats", When the user saves or renames another saved search to the same name, Then it is rejected with a message.

## Edge cases

- A saved search whose filter refers to a value that no longer exists (for example, a removed municipality): it runs with the remaining filters and tells the user which filter was ignored.
- A saved search with no results: zero results are shown, the saved search is kept.
- Saving a search with no filters: allowed, it stores the empty filter set.
- A very long name: it is limited in length and the user is told.
- Removing a favorite twice in quick succession: the second removal has no effect and no error is shown.

## Out of scope (MVP)

- Sharing favorites or saved searches with other users.
- Folders, tags, or notes on favorites.
- Alerts when a saved search has new results ([HR-F011](/features/hr-f011-notifications/), post-MVP).

## Related decisions

[D12](/adr/d12-web-internationalization/), [D13](/adr/d13-users-and-authentication/), [D19](/adr/d19-search-read-model/).
