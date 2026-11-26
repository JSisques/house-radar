import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  type IProcessedEventRepository,
  PROCESSED_EVENT_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/processed-event-repository.port';
import {
  type IProjectedListingRepository,
  PROJECTED_LISTING_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/projected-listing-repository.port';
import {
  type ITransactionManager,
  TRANSACTION_MANAGER_TOKEN,
} from '@contexts/properties/application/ports/transaction-manager.port';
import { RefreshPropertySearchViewOfListingService } from '@contexts/properties/application/services/write/refresh-property-search-view-of-listing/refresh-property-search-view-of-listing.service';

import { ProjectListingObservedCommand } from './project-listing-observed.command';

export const PROJECT_LISTING_OBSERVED_CONSUMER = 'properties.project-listing-observed';

/**
 * A disappeared listing is observed with that status: it stops counting toward the price, and its earlier observations
 * stay in the listing state (HR-F002-AC9).
 */
@CommandHandler(ProjectListingObservedCommand)
export class ProjectListingObservedHandler implements ICommandHandler<ProjectListingObservedCommand, void> {
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN) private readonly transactions: ITransactionManager,
    @Inject(PROCESSED_EVENT_REPOSITORY_TOKEN) private readonly processedEvents: IProcessedEventRepository,
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(RefreshPropertySearchViewOfListingService)
    private readonly refresher: RefreshPropertySearchViewOfListingService,
  ) {}

  async execute(command: ProjectListingObservedCommand): Promise<void> {
    await this.transactions.run(async () => {
      if (!(await this.processedEvents.claim(command.eventId, PROJECT_LISTING_OBSERVED_CONSUMER))) return;
      await this.listings.applyObserved(command);
      await this.refresher.execute({ listingId: command.listingId });
    });
  }
}
