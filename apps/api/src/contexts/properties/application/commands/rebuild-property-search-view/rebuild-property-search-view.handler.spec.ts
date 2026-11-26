import { describe, expect, it, vi } from 'vitest';

import { RebuildPropertySearchViewHandler } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.handler';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import type { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';

const setup = (propertyIds: string[]) => {
  const transactions: ITransactionManager = { run: (fn) => fn() };
  const listings = {
    listPropertyIds: vi.fn(() => Promise.resolve(propertyIds)),
  } as unknown as IProjectedListingRepository;
  const refresher = { refresh: vi.fn(() => Promise.resolve()) } as unknown as PropertySearchViewRefresherService;
  return { handler: new RebuildPropertySearchViewHandler(transactions, listings, refresher), refresher };
};

describe('RebuildPropertySearchViewHandler', () => {
  describe('execute', () => {
    it('should refresh the view of every property', async () => {
      const { handler, refresher } = setup(['property-1', 'property-2']);

      await handler.execute();

      expect(refresher.refresh).toHaveBeenCalledTimes(2);
      expect(refresher.refresh).toHaveBeenCalledWith('property-1');
      expect(refresher.refresh).toHaveBeenCalledWith('property-2');
    });

    it('should refresh nothing when there are no properties', async () => {
      const { handler, refresher } = setup([]);

      await handler.execute();

      expect(refresher.refresh).not.toHaveBeenCalled();
    });
  });
});
