// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.spec.ts
// RED first: write this spec, watch it fail, then implement. No @nestjs/testing.
// Mocks are typed against the port; no `as never` / `as any` casts.
import { EventBus } from '@nestjs/cqrs';
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import { IListingWriteRepository } from '@contexts/listings/domain/repositories/write/listing-write.repository';

import { ImportManualListingCommand } from './import-manual-listing.command';
import { ImportManualListingHandler } from './import-manual-listing.handler';

const VALID_INPUT = {
  sourceUrl: 'https://example.com/listing/1',
  title: 'Flat in Santiago',
  priceCents: 15_000_000,
};

describe('ImportManualListingHandler', () => {
  let listingWriteRepository: Mocked<IListingWriteRepository>;
  let eventBus: Mocked<Pick<EventBus, 'publishAll'>>;
  let handler: ImportManualListingHandler;

  beforeEach(() => {
    listingWriteRepository = { save: vi.fn(), findById: vi.fn(), delete: vi.fn() };
    eventBus = { publishAll: vi.fn() };
    handler = new ImportManualListingHandler(listingWriteRepository, eventBus as unknown as EventBus);
  });

  describe('execute', () => {
    it('should save the listing with the command values', async () => {
      await handler.execute(new ImportManualListingCommand(VALID_INPUT));

      const saved = listingWriteRepository.save.mock.calls[0][0];
      expect(saved.title.value).toBe(VALID_INPUT.title);
      expect(saved.price.toPrimitives().amountCents).toBe(VALID_INPUT.priceCents);
    });

    it('should return the id of the saved listing', async () => {
      const result = await handler.execute(new ImportManualListingCommand(VALID_INPUT));

      const saved = listingWriteRepository.save.mock.calls[0][0];
      expect(result).toEqual({ id: saved.id.value });
    });

    it('should publish a ListingImportedEvent after saving', async () => {
      await handler.execute(new ImportManualListingCommand(VALID_INPUT));

      const [events] = eventBus.publishAll.mock.calls[0];
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ListingImportedEvent);
      expect(listingWriteRepository.save.mock.invocationCallOrder[0]).toBeLessThan(
        eventBus.publishAll.mock.invocationCallOrder[0],
      );
    });

    it('should not publish events when saving fails', async () => {
      listingWriteRepository.save.mockRejectedValueOnce(new Error('db down'));

      await expect(handler.execute(new ImportManualListingCommand(VALID_INPUT))).rejects.toThrow('db down');
      expect(eventBus.publishAll).not.toHaveBeenCalled();
    });
  });
});
