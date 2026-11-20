// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.ts
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import {
  IListingWriteRepository,
  LISTING_WRITE_REPOSITORY_TOKEN,
} from '@contexts/listings/domain/repositories/listing-write.repository';

import { ImportManualListingCommand } from './import-manual-listing.command';

@CommandHandler(ImportManualListingCommand)
export class ImportManualListingHandler implements ICommandHandler<ImportManualListingCommand, { id: string }> {
  constructor(
    @Inject(LISTING_WRITE_REPOSITORY_TOKEN)
    private readonly listingWriteRepository: IListingWriteRepository,
    private readonly listingBuilder: ListingBuilder,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ImportManualListingCommand): Promise<{ id: string }> {
    const listing = this.listingBuilder.withPrimitives(command).build();
    listing.create();

    await this.listingWriteRepository.save(listing);
    await this.eventBus.publishAll(listing.pullDomainEvents());

    return { id: listing.id.value };
  }
}
