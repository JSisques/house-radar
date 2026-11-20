// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.spec.ts
// RED first: write this spec, watch it fail, then implement. No @nestjs/testing.
// Mocks are typed against the port; no `as never` / `as any` casts.
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import { ListingBuilderFactory } from '@contexts/listings/domain/builders/listing/listing-builder.factory';
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
  let handler: ImportManualListingHandler;

  beforeEach(() => {
    listingWriteRepository = { save: vi.fn(), findById: vi.fn(), delete: vi.fn() };
    handler = new ImportManualListingHandler(
      listingWriteRepository,
      new ListingBuilderFactory(), // real factory: builders are pure domain code
    );
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

    it('should save an aggregate that carries the recorded ListingImportedEvent', async () => {
      await handler.execute(new ImportManualListingCommand(VALID_INPUT));

      // The handler does not publish: the repository contract persists peekDomainEvents()
      // into the outbox in the same transaction (covered by the repository integration test).
      const saved = listingWriteRepository.save.mock.calls[0][0];
      const events = saved.peekDomainEvents(); // peek: never drain events in assertions
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ListingImportedEvent);
    });

    it('should propagate the error when saving fails', async () => {
      listingWriteRepository.save.mockRejectedValueOnce(new Error('db down'));

      await expect(handler.execute(new ImportManualListingCommand(VALID_INPUT))).rejects.toThrow('db down');
    });
  });
});
