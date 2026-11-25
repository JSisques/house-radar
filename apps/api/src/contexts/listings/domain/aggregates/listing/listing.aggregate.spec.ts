import { describe, expect, it } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import {
  Area,
  ExternalId,
  known,
  ListingId,
  ListingUrl,
  Money,
  PropertyType,
  SourceId,
  UNKNOWN,
} from '@house-radar/shared-kernel';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

const addedAt = new DateValueObject(new Date('2026-11-25T10:00:00.000Z'));

const baseBuilder = (): ListingBuilder =>
  new ListingBuilder()
    .withSource(new SourceId('idealista'))
    .withOriginalUrl(new ListingUrl('https://www.idealista.com/inmueble/123/'))
    .withAddedAt(addedAt);

describe('Listing', () => {
  it('has the same field set whatever the source (HR-F002-AC1)', () => {
    const fromPortal = baseBuilder().withExternalId(new ExternalId('123')).build();
    const fromFeed = new ListingBuilder()
      .withSource(new SourceId('fotocasa'))
      .withOriginalUrl(new ListingUrl('https://www.fotocasa.es/x/456'))
      .withAddedAt(addedAt)
      .withExternalId(new ExternalId('456'))
      .withTitle(known(new ListingTitle('Piso'), 'declared'))
      .withBuiltArea(known(new Area(90), 'declared'))
      .build();

    expect(Object.keys(fromPortal.toPrimitives()).sort()).toEqual(Object.keys(fromFeed.toPrimitives()).sort());
  });

  it('keeps every unspecified field Unknown, including the year (HR-F002-AC2)', () => {
    const primitives = baseBuilder().build().toPrimitives();

    expect(primitives.yearBuilt).toEqual({ kind: 'unknown' });
    expect(primitives.title).toEqual({ kind: 'unknown' });
    expect(primitives.price).toEqual({ kind: 'unknown' });
    expect(primitives.builtArea).toEqual({ kind: 'unknown' });
    expect(primitives.bedrooms).toEqual({ kind: 'unknown' });
    expect(primitives.features.garage).toEqual({ kind: 'unknown' });
  });

  it('serializes known fields with their value and origin', () => {
    const listing = baseBuilder()
      .withYearBuilt(known(new YearBuilt(1998), 'declared'))
      .withPrice(known(Money.fromEuros(200000), 'declared'))
      .withPropertyType(known(new PropertyType('flat'), 'declared'))
      .build();
    const primitives = listing.toPrimitives();

    expect(primitives.yearBuilt).toEqual({ kind: 'known', value: 1998, origin: 'declared' });
    expect(primitives.price).toEqual({ kind: 'known', value: 20000000, origin: 'declared' });
    expect(primitives.propertyType).toEqual({ kind: 'known', value: 'flat', origin: 'declared' });
  });

  it('records source, original URL, date added and last check on creation (HR-F002-AC10, HR-F001-BR12)', () => {
    const listing = baseBuilder().build();
    const primitives = listing.toPrimitives();

    expect(primitives.source).toBe('idealista');
    expect(primitives.originalUrl).toBe('https://www.idealista.com/inmueble/123/');
    expect(primitives.addedAt).toEqual(addedAt.value);
    expect(primitives.lastCheckedAt).toEqual(addedAt.value);
    expect(primitives.status).toBe('active');
  });

  it('gets an internal UUIDv7 identity when it has no external id (HR-F001-AC11)', () => {
    const manual = new ListingBuilder()
      .withSource(new SourceId('manual'))
      .withOriginalUrl(new ListingUrl('https://example.com/casa'))
      .withAddedAt(addedAt)
      .build();

    expect(manual.externalId).toBeUndefined();
    expect(manual.id).toBeInstanceOf(ListingId);
    expect(manual.toPrimitives().externalId).toBeNull();
  });

  it('keeps the external id and a supplied identity', () => {
    const id = ListingId.generate();
    const listing = baseBuilder().withId(id).withExternalId(new ExternalId('123')).build();

    expect(listing.id.equals(id)).toBe(true);
    expect(listing.toPrimitives().externalId).toBe('123');
  });

  it('records ListingImported with the primitives when created', () => {
    const listing = baseBuilder().withExternalId(new ExternalId('123')).build();
    expect(listing.peekDomainEvents()).toHaveLength(0);

    listing.create();

    const [event] = listing.peekDomainEvents();
    expect(event).toBeInstanceOf(ListingImportedEvent);
    expect((event as ListingImportedEvent).payload).toEqual(listing.toPrimitives());
    expect(listing.isNew()).toBe(true);
  });

  it('does not record events when hydrated', () => {
    expect(baseBuilder().build().peekDomainEvents()).toHaveLength(0);
    expect(UNKNOWN.kind).toBe('unknown');
  });
});
