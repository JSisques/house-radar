import { describe, expect, it, vi } from 'vitest';

import { ListingId, PropertyId } from '@house-radar/shared-kernel';

import { CreatePropertyFromListingObservedCommand } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.command';
import { CreatePropertyFromListingObservedHandler } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.handler';
import type { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import type { PropertyAggregate } from '@contexts/properties/domain/aggregates/property/property.aggregate';
import { PropertyBuilderFactory } from '@contexts/properties/domain/builders/property/property-builder.factory';
import { PropertyCreatedEvent } from '@contexts/properties/domain/events/property-created/property-created.event';
import type { IPropertyWriteRepository } from '@contexts/properties/domain/repositories/write/property-write.repository';

const LISTING_ID = ListingId.generate();
const EVENT_ID = 'event-1';

const command = (version = 1, eventId = EVENT_ID) =>
  new CreatePropertyFromListingObservedCommand({
    eventId,
    listingId: LISTING_ID.value,
    aggregateVersion: version,
  });

/** In-memory ports that behave like the real ones: claims are remembered, saved properties are found by listing. */
const setup = () => {
  const claimed = new Set<string>();
  const stored = new Map<string, PropertyAggregate>();
  const processedEvents: IProcessedEventRepository = {
    claim: vi.fn((eventId: string, consumer: string) => {
      const key = `${eventId}:${consumer}`;
      if (claimed.has(key)) return Promise.resolve(false);
      claimed.add(key);
      return Promise.resolve(true);
    }),
  };
  const properties: IPropertyWriteRepository = {
    findById: vi.fn(),
    delete: vi.fn(),
    findByListingId: vi.fn((listingId: ListingId) => {
      const found = [...stored.values()].find((property) => property.hasListing(listingId));
      return Promise.resolve(found ?? null);
    }),
    save: vi.fn((property: PropertyAggregate) => {
      stored.set(property.id.value, property);
      return Promise.resolve();
    }),
  };
  const run = vi.fn();
  const transactions: ITransactionManager = {
    run: <T>(fn: () => Promise<T>): Promise<T> => {
      run();
      return fn();
    },
  };
  const onlyProperty = (): PropertyAggregate => {
    const [property] = [...stored.values()];
    if (property === undefined) throw new Error('no property was stored');
    return property;
  };
  const handler = new CreatePropertyFromListingObservedHandler(
    transactions,
    processedEvents,
    properties,
    new PropertyBuilderFactory(),
  );
  return { handler, properties, stored, onlyProperty, transactionRuns: run };
};

describe('CreatePropertyFromListingObservedHandler', () => {
  it('creates one property that references the observed listing and records PropertyCreated', async () => {
    const { handler, properties, stored, onlyProperty } = setup();

    await handler.execute(command());

    expect(stored.size).toBe(1);
    const property = onlyProperty();
    expect(property.listingIds.map((id) => id.value)).toEqual([LISTING_ID.value]);
    expect(property.id).toBeInstanceOf(PropertyId);
    expect(property.peekDomainEvents()[0]).toBeInstanceOf(PropertyCreatedEvent);
    expect(properties.save).toHaveBeenCalledTimes(1);
  });

  it('runs in one transaction', async () => {
    const { handler, transactionRuns } = setup();

    await handler.execute(command());

    expect(transactionRuns).toHaveBeenCalledTimes(1);
  });

  it('keeps one property when the same event is delivered twice', async () => {
    const { handler, properties, stored } = setup();

    await handler.execute(command());
    await handler.execute(command());

    expect(stored.size).toBe(1);
    expect(properties.save).toHaveBeenCalledTimes(1);
  });

  it('ignores an older event for a listing that already has a newer version applied', async () => {
    const { handler, properties, stored, onlyProperty } = setup();
    await handler.execute(command(3, 'event-3'));

    await handler.execute(command(2, 'event-2'));

    expect(stored.size).toBe(1);
    expect(properties.save).toHaveBeenCalledTimes(1);
    expect(onlyProperty().appliedVersionOf(LISTING_ID)).toBe(3);
  });

  it('keeps one property and remembers the newer version when a newer event arrives', async () => {
    const { handler, stored, onlyProperty } = setup();
    await handler.execute(command(1, 'event-1'));

    await handler.execute(command(2, 'event-2'));

    expect(stored.size).toBe(1);
    expect(onlyProperty().appliedVersionOf(LISTING_ID)).toBe(2);
  });
});
