import { describe, expect, it, vi } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import { ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

import { ListingsRegistryAdapter } from '@contexts/ingestion/infrastructure/adapters/listings-registry/listings-registry.adapter';
import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import type { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import { ListingBuilderFactory } from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import { ObservationBuilderFactory } from '@contexts/listings/domain/builders/observation/observation-builder.factory';

const OBSERVED_AT = new DateValueObject(new Date('2026-11-25T10:00:00Z'));

function setup(existingIds: string[] = []) {
  const saved: { listing?: ListingAggregate; observation?: ObservationAggregate } = {};
  const listingRead = {
    findByCriteria: vi.fn().mockResolvedValue({ items: existingIds.map((id) => ({ id })) }),
  };
  const listingWrite = {
    save: vi.fn(async (listing: ListingAggregate) => {
      saved.listing = listing;
    }),
  };
  const observationWrite = {
    save: vi.fn(async (observation: ObservationAggregate) => {
      saved.observation = observation;
    }),
  };
  const adapter = new ListingsRegistryAdapter(
    listingRead as never,
    listingWrite as never,
    observationWrite as never,
    new ListingBuilderFactory(),
    new ObservationBuilderFactory(),
  );
  return { adapter, listingRead, listingWrite, observationWrite, saved };
}

describe('ListingsRegistryAdapter', () => {
  const url = new ListingUrl('https://example.com/home/1?ref=a#photos');

  it('should return null when no manual listing has that normalized url', async () => {
    const { adapter, listingRead } = setup();

    expect(await adapter.findManualByNormalizedUrl(url)).toBeNull();
    expect(listingRead.findByCriteria).toHaveBeenCalledTimes(1);
  });

  it('should return the id of the existing manual listing', async () => {
    const id = ListingId.generate().value;
    const { adapter } = setup([id]);

    expect((await adapter.findManualByNormalizedUrl(url))?.value).toBe(id);
  });

  it('should create the listing and its first observation without a run id', async () => {
    const { adapter, saved } = setup();

    const id = await adapter.registerManual({
      source: new SourceId('manual'),
      url,
      price: new Money(25000000),
      observedAt: OBSERVED_AT,
      details: {},
    });

    const listing = saved.listing?.toPrimitives();
    expect(listing?.id).toBe(id.value);
    expect(listing?.source).toBe('manual');
    expect(listing?.originalUrl).toBe('https://example.com/home/1');
    expect(listing?.price).toEqual({ kind: 'known', origin: 'declared', value: 25000000 });
    expect(listing?.title).toEqual({ kind: 'unknown' });
    const observation = saved.observation?.toPrimitives();
    expect(observation?.listingId).toBe(id.value);
    expect(observation?.runId).toBeNull();
    expect(observation?.price).toEqual({ kind: 'known', origin: 'declared', value: 25000000 });
    expect(saved.listing?.peekDomainEvents().length).toBeGreaterThan(0);
    expect(saved.observation?.peekDomainEvents().length).toBeGreaterThan(0);
  });

  it('should carry the optional details onto the listing as declared values', async () => {
    const { adapter, saved } = setup();

    await adapter.registerManual({
      source: new SourceId('manual'),
      url,
      price: new Money(25000000),
      observedAt: OBSERVED_AT,
      details: {
        title: 'Piso luminoso',
        builtArea: 92.5,
        bedrooms: 3,
        propertyType: 'flat',
        features: { garage: true, energyCertificate: 'C' },
      },
    });

    const listing = saved.listing?.toPrimitives();
    const declared = (value: unknown) => ({ kind: 'known', origin: 'declared', value });
    expect(listing?.title).toEqual(declared('Piso luminoso'));
    expect(listing?.builtArea).toEqual(declared(92.5));
    expect(listing?.bedrooms).toEqual(declared(3));
    expect(listing?.propertyType).toEqual(declared('flat'));
    expect(listing?.features.garage).toEqual(declared(true));
    expect(listing?.features.energyCertificate).toEqual(declared('C'));
  });

  it('should save the listing before its observation', async () => {
    const { adapter, listingWrite, observationWrite } = setup();

    await adapter.registerManual({
      source: new SourceId('manual'),
      url,
      price: new Money(1),
      observedAt: OBSERVED_AT,
      details: {},
    });

    expect(listingWrite.save.mock.invocationCallOrder[0]).toBeLessThan(
      observationWrite.save.mock.invocationCallOrder[0] as number,
    );
  });
});
