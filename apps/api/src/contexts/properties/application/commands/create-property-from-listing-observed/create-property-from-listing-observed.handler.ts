import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import {
  type IProcessedEventRepository,
  PROCESSED_EVENT_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/processed-event-repository.port';
import {
  type ITransactionManager,
  TRANSACTION_MANAGER_TOKEN,
} from '@contexts/properties/application/ports/transaction-manager.port';
import {
  type IPropertyBuilderFactory,
  PROPERTY_BUILDER_FACTORY_TOKEN,
} from '@contexts/properties/domain/builders/property/property-builder.factory';
import {
  type IPropertyWriteRepository,
  PROPERTY_WRITE_REPOSITORY,
} from '@contexts/properties/domain/repositories/write/property-write.repository';

import { CreatePropertyFromListingObservedCommand } from './create-property-from-listing-observed.command';

export const CREATE_PROPERTY_CONSUMER = 'properties.create-property-from-listing-observed';

/**
 * Every new listing gets its own property (1:1). The claim and the write share one transaction, so a redelivery is
 * skipped; an event not newer than the version already applied for the listing is ignored (D31).
 */
@CommandHandler(CreatePropertyFromListingObservedCommand)
export class CreatePropertyFromListingObservedHandler implements ICommandHandler<
  CreatePropertyFromListingObservedCommand,
  void
> {
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN) private readonly transactions: ITransactionManager,
    @Inject(PROCESSED_EVENT_REPOSITORY_TOKEN) private readonly processedEvents: IProcessedEventRepository,
    @Inject(PROPERTY_WRITE_REPOSITORY) private readonly properties: IPropertyWriteRepository,
    @Inject(PROPERTY_BUILDER_FACTORY_TOKEN) private readonly builders: IPropertyBuilderFactory,
  ) {}

  async execute(command: CreatePropertyFromListingObservedCommand): Promise<void> {
    await this.transactions.run(async () => {
      if (!(await this.processedEvents.claim(command.eventId, CREATE_PROPERTY_CONSUMER))) return;

      const existing = await this.properties.findByListingId(command.listingId);
      if (existing === null) {
        const property = this.builders.create().withListing(command.listingId, command.aggregateVersion).build();
        property.create();
        await this.properties.save(property);
        return;
      }

      if (!existing.isNewerThanApplied(command.listingId, command.aggregateVersion)) return;
      existing.recordListingVersion(command.listingId, command.aggregateVersion);
      await this.properties.save(existing);
    });
  }
}
