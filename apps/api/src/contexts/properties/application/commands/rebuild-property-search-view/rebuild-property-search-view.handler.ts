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
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/property-search-view-refresher/property-search-view-refresher.service';

import { RebuildPropertySearchViewCommand } from './rebuild-property-search-view.command';

/** The view is derived data: when the consolidation rules change it is recomputed from the stored listing state. */
@CommandHandler(RebuildPropertySearchViewCommand)
export class RebuildPropertySearchViewHandler implements ICommandHandler<RebuildPropertySearchViewCommand, void> {
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN) private readonly transactions: ITransactionManager,
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(PropertySearchViewRefresherService) private readonly refresher: PropertySearchViewRefresherService,
  ) {}

  async execute(): Promise<void> {
    await this.transactions.run(async () => {
      for (const propertyId of await this.listings.listPropertyIds()) {
        await this.refresher.refresh(propertyId);
      }
    });
  }
}
