// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.ts
// Builders are stateful: create a new one per execution. Never inject a builder
// as a singleton provider, or concurrent requests would share its state.
import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { DateValueObject } from '@house-radar/building-blocks';
import { ListingId } from '@house-radar/shared-kernel';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import {
  IListingWriteRepository,
  LISTING_WRITE_REPOSITORY_TOKEN,
} from '@contexts/listings/domain/repositories/write/listing-write.repository';

import { ImportManualListingCommand } from './import-manual-listing.command';

@CommandHandler(ImportManualListingCommand)
export class ImportManualListingHandler
  implements ICommandHandler<ImportManualListingCommand, { id: string }>
{
  constructor(
    @Inject(LISTING_WRITE_REPOSITORY_TOKEN)
    private readonly listingWriteRepository: IListingWriteRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ImportManualListingCommand): Promise<{ id: string }> {
    const now = new DateValueObject(new Date());
    const listing = new ListingBuilder()
      .withId(ListingId.generate())
      .withCreatedAt(now)
      .withUpdatedAt(now)
      .withSourceUrl(command.sourceUrl)
      .withTitle(command.title)
      .withPrice(command.price)
      .build();
    listing.create();

    await this.listingWriteRepository.save(listing);
    await this.eventBus.publishAll(listing.pullDomainEvents());

    return { id: listing.id.value };
  }
}
