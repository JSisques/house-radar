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
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';

import { ProjectListingImportedCommand } from './project-listing-imported.command';

export const PROJECT_LISTING_IMPORTED_CONSUMER = 'properties.project-listing-imported';

/** The claim, the listing state and the refreshed view share one transaction, so a redelivery is skipped (D31). */
@CommandHandler(ProjectListingImportedCommand)
export class ProjectListingImportedHandler implements ICommandHandler<ProjectListingImportedCommand, void> {
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN) private readonly transactions: ITransactionManager,
    @Inject(PROCESSED_EVENT_REPOSITORY_TOKEN) private readonly processedEvents: IProcessedEventRepository,
    @Inject(PROJECTED_LISTING_REPOSITORY_TOKEN) private readonly listings: IProjectedListingRepository,
    @Inject(PropertySearchViewRefresherService) private readonly refresher: PropertySearchViewRefresherService,
  ) {}

  async execute(command: ProjectListingImportedCommand): Promise<void> {
    await this.transactions.run(async () => {
      if (!(await this.processedEvents.claim(command.eventId, PROJECT_LISTING_IMPORTED_CONSUMER))) return;
      await this.listings.applyImported(command);
      await this.refresher.refreshPropertyOf(command.listingId);
    });
  }
}
