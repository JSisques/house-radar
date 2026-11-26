import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  type IProjectedListingRepository,
  PROJECTED_LISTING_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/projected-listing-repository.port';
import {
  type ITransactionManager,
  TRANSACTION_MANAGER_TOKEN,
} from '@contexts/properties/application/ports/transaction-manager.port';
import { RefreshPropertySearchViewService } from '@contexts/properties/application/services/write/refresh-property-search-view/refresh-property-search-view.service';

import { RebuildPropertySearchViewCommand } from './rebuild-property-search-view.command';

/** The view is derived data: when the consolidation rules change it is recomputed from the stored listing state. */
@CommandHandler(RebuildPropertySearchViewCommand)
export class RebuildPropertySearchViewHandler implements ICommandHandler<RebuildPropertySearchViewCommand, void> {
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN) private readonly transactions: ITransactionManager,
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(RefreshPropertySearchViewService) private readonly refresher: RefreshPropertySearchViewService,
  ) {}

  async execute(): Promise<void> {
    await this.transactions.run(async () => {
      const propertyIds = await this.listings.listPropertyIds();
      await Promise.all(propertyIds.map((propertyId) => this.refresher.execute({ propertyId })));
    });
  }
}
