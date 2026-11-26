import { describe, expect, it, vi } from 'vitest';

import { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import { ProjectListingImportedHandler } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.handler';
import type { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import type { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';

const LISTING_ID = '01900000-0000-7000-8000-0000000000aa';

const command = () =>
  new ProjectListingImportedCommand({
    eventId: 'event-1',
    listingId: LISTING_ID,
    source: 'fotocasa',
    status: 'active',
    priceCents: 20_000_000,
    attributes: { builtArea: 100 },
    observedAt: new Date('2026-11-01T10:00:00Z'),
  });

const setup = (claimed = true) => {
  const calls: string[] = [];
  const transactions: ITransactionManager = {
    run: async <T>(fn: () => Promise<T>): Promise<T> => {
      calls.push('begin');
      const result = await fn();
      calls.push('commit');
      return result;
    },
  };
  const processedEvents: IProcessedEventRepository = {
    claim: vi.fn(() => {
      calls.push('claim');
      return Promise.resolve(claimed);
    }),
  };
  const listings = {
    applyImported: vi.fn(() => {
      calls.push('apply');
      return Promise.resolve();
    }),
  } as unknown as IProjectedListingRepository;
  const refresher = {
    refreshPropertyOf: vi.fn(() => {
      calls.push('refresh');
      return Promise.resolve();
    }),
  } as unknown as PropertySearchViewRefresherService;
  const handler = new ProjectListingImportedHandler(transactions, processedEvents, listings, refresher);
  return { handler, calls, processedEvents, listings, refresher };
};

describe('ProjectListingImportedHandler', () => {
  describe('execute', () => {
    it('should claim the event, apply the listing and refresh its property in one transaction', async () => {
      const { handler, calls, processedEvents, listings, refresher } = setup();

      await handler.execute(command());

      expect(processedEvents.claim).toHaveBeenCalledWith('event-1', 'properties.project-listing-imported');
      expect(listings.applyImported).toHaveBeenCalledWith(expect.objectContaining({ listingId: LISTING_ID }));
      expect(refresher.refreshPropertyOf).toHaveBeenCalledWith(LISTING_ID);
      expect(calls).toEqual(['begin', 'claim', 'apply', 'refresh', 'commit']);
    });

    it('should do nothing for a redelivered event', async () => {
      const { handler, listings, refresher } = setup(false);

      await handler.execute(command());

      expect(listings.applyImported).not.toHaveBeenCalled();
      expect(refresher.refreshPropertyOf).not.toHaveBeenCalled();
    });
  });
});
