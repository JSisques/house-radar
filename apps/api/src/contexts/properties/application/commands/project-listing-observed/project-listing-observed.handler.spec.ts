import { describe, expect, it, vi } from 'vitest';

import { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import { ProjectListingObservedHandler } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.handler';
import type { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import type { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';

const LISTING_ID = '01900000-0000-7000-8000-0000000000aa';

const command = () =>
  new ProjectListingObservedCommand({
    eventId: 'event-1',
    listingId: LISTING_ID,
    status: 'disappeared',
    priceCents: 20_000_000,
    observedAt: new Date('2026-11-02T10:00:00Z'),
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
    applyObserved: vi.fn(() => {
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
  const handler = new ProjectListingObservedHandler(transactions, processedEvents, listings, refresher);
  return { handler, calls, processedEvents, listings, refresher };
};

describe('ProjectListingObservedHandler', () => {
  describe('execute', () => {
    it('should claim the event, apply the observation and refresh the property in one transaction', async () => {
      const { handler, calls, processedEvents, listings, refresher } = setup();

      await handler.execute(command());

      expect(processedEvents.claim).toHaveBeenCalledWith('event-1', 'properties.project-listing-observed');
      expect(listings.applyObserved).toHaveBeenCalledWith(
        expect.objectContaining({ listingId: LISTING_ID, status: 'disappeared' }),
      );
      expect(refresher.refreshPropertyOf).toHaveBeenCalledWith(LISTING_ID);
      expect(calls).toEqual(['begin', 'claim', 'apply', 'refresh', 'commit']);
    });

    it('should do nothing for a redelivered event', async () => {
      const { handler, listings, refresher } = setup(false);

      await handler.execute(command());

      expect(listings.applyObserved).not.toHaveBeenCalled();
      expect(refresher.refreshPropertyOf).not.toHaveBeenCalled();
    });
  });
});
