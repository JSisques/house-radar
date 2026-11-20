// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.spec.ts
// RED first: write this spec, watch it fail, then implement. No @nestjs/testing.
import { describe, expect, it, vi } from 'vitest';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';

import { ImportManualListingCommand } from './import-manual-listing.command';
import { ImportManualListingHandler } from './import-manual-listing.handler';

describe('ImportManualListingHandler', () => {
  const buildHandler = () => {
    const listingWriteRepository = { save: vi.fn(), findById: vi.fn(), delete: vi.fn() };
    const eventBus = { publishAll: vi.fn() };
    const listingBuilder = new ListingBuilder(); // fluent withX() + build(); real builder, not a mock
    const handler = new ImportManualListingHandler(listingWriteRepository, listingBuilder, eventBus as never);
    return { handler, listingWriteRepository, eventBus };
  };

  describe('execute', () => {
    it('should save the listing and return its id', async () => {
      const { handler, listingWriteRepository } = buildHandler();

      const result = await handler.execute(
        new ImportManualListingCommand({ sourceUrl: 'https://example.com/1', title: 'Flat', priceCents: 15000000 }),
      );

      expect(listingWriteRepository.save).toHaveBeenCalledOnce();
      expect(result.id).toBeDefined();
    });

    it('should publish the domain events recorded by the aggregate', async () => {
      const { handler, eventBus } = buildHandler();

      await handler.execute(
        new ImportManualListingCommand({ sourceUrl: 'https://example.com/1', title: 'Flat', priceCents: 15000000 }),
      );

      expect(eventBus.publishAll).toHaveBeenCalledOnce();
    });
  });
});
