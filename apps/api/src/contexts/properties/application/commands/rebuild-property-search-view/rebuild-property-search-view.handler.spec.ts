import { describe, expect, it, vi } from 'vitest';

import { RebuildPropertySearchViewHandler } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.handler';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import type { RefreshPropertySearchViewService } from '@contexts/properties/application/services/write/refresh-property-search-view/refresh-property-search-view.service';

const setup = (propertyIds: string[]) => {
  const transactions: ITransactionManager = { run: (fn) => fn() };
  const listings = {
    listPropertyIds: vi.fn(() => Promise.resolve(propertyIds)),
  } as unknown as IProjectedListingRepository;
  const refresher = { execute: vi.fn(() => Promise.resolve()) } as unknown as RefreshPropertySearchViewService;
  return { handler: new RebuildPropertySearchViewHandler(transactions, listings, refresher), refresher };
};

describe('RebuildPropertySearchViewHandler', () => {
  describe('execute', () => {
    it('should refresh the view of every property', async () => {
      const { handler, refresher } = setup(['property-1', 'property-2']);

      await handler.execute();

      expect(refresher.execute).toHaveBeenCalledTimes(2);
      expect(refresher.execute).toHaveBeenCalledWith({ propertyId: 'property-1' });
      expect(refresher.execute).toHaveBeenCalledWith({ propertyId: 'property-2' });
    });

    it('should refresh nothing when there are no properties', async () => {
      const { handler, refresher } = setup([]);

      await handler.execute();

      expect(refresher.execute).not.toHaveBeenCalled();
    });
  });
});
