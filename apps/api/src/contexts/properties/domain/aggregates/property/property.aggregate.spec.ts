import { describe, expect, it } from 'vitest';

import { ListingId, PropertyId } from '@house-radar/shared-kernel';

import { PropertyBuilder } from '@contexts/properties/domain/builders/property/property.builder';
import { PropertyCreatedEvent } from '@contexts/properties/domain/events/property-created/property-created.event';

const LISTING_ID = ListingId.generate();

describe('PropertyAggregate', () => {
  it('references its listings and knows the version applied for each', () => {
    const property = new PropertyBuilder().withListing(LISTING_ID, 4).build();

    expect(property.hasListing(LISTING_ID)).toBe(true);
    expect(property.hasListing(ListingId.generate())).toBe(false);
    expect(property.appliedVersionOf(LISTING_ID)).toBe(4);
    expect(property.appliedVersionOf(ListingId.generate())).toBeNull();
  });

  it('gets a fresh id when none is given and keeps a given one', () => {
    const id = PropertyId.generate();

    expect(new PropertyBuilder().withListing(LISTING_ID, 1).build().id).toBeInstanceOf(PropertyId);
    expect(new PropertyBuilder().withId(id).withListing(LISTING_ID, 1).build().id.equals(id)).toBe(true);
  });

  it('rejects a property without listings', () => {
    expect(() => new PropertyBuilder().build()).toThrow();
  });

  it('records PropertyCreated with its primitives', () => {
    const property = new PropertyBuilder().withListing(LISTING_ID, 1).build();

    property.create();

    const [event] = property.peekDomainEvents();
    expect(event).toBeInstanceOf(PropertyCreatedEvent);
    expect((event as PropertyCreatedEvent).payload).toEqual({
      id: property.id.value,
      listings: [{ listingId: LISTING_ID.value, version: 1 }],
    });
  });

  it('only treats a strictly newer version as newer than the applied one', () => {
    const property = new PropertyBuilder().withListing(LISTING_ID, 3).build();

    expect(property.isNewerThanApplied(LISTING_ID, 4)).toBe(true);
    expect(property.isNewerThanApplied(LISTING_ID, 3)).toBe(false);
    expect(property.isNewerThanApplied(LISTING_ID, 2)).toBe(false);
    expect(property.isNewerThanApplied(ListingId.generate(), 1)).toBe(true);
  });

  it('remembers a newer version for a member listing and ignores a stranger', () => {
    const property = new PropertyBuilder().withListing(LISTING_ID, 1).build();

    property.recordListingVersion(LISTING_ID, 5);
    property.recordListingVersion(ListingId.generate(), 9);

    expect(property.appliedVersionOf(LISTING_ID)).toBe(5);
    expect(property.listingIds).toHaveLength(1);
  });
});
