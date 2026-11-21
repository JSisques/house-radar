// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.handler.ts
// Builders are stateful and never injected. Inject the stateless builder factory
// and call create() on every execution, so no state survives between calls.
// Handlers never publish events: the aggregate records them and the write repository
// persists peekDomainEvents() into the outbox in the same transaction and clears them
// after commit (D31).
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DateValueObject } from '@house-radar/building-blocks';
import { ListingId } from '@house-radar/shared-kernel';

import {
  IListingBuilderFactory,
  LISTING_BUILDER_FACTORY_TOKEN,
} from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import {
  IListingWriteRepository,
  LISTING_WRITE_REPOSITORY_TOKEN,
} from '@contexts/listings/domain/repositories/write/listing-write.repository';

import { ImportManualListingCommand } from './import-manual-listing.command';

@CommandHandler(ImportManualListingCommand)
export class ImportManualListingHandler implements ICommandHandler<ImportManualListingCommand, { id: string }> {
  constructor(
    @Inject(LISTING_WRITE_REPOSITORY_TOKEN)
    private readonly listingWriteRepository: IListingWriteRepository,
    @Inject(LISTING_BUILDER_FACTORY_TOKEN)
    private readonly listingBuilderFactory: IListingBuilderFactory,
  ) {}

  async execute(command: ImportManualListingCommand): Promise<{ id: string }> {
    const now = new DateValueObject(new Date());
    const listing = this.listingBuilderFactory
      .create()
      .withId(ListingId.generate()) // UUIDv7 via the `uuid` package (D32)
      .withCreatedAt(now)
      .withUpdatedAt(now)
      .withSourceUrl(command.sourceUrl)
      .withTitle(command.title)
      .withPrice(command.price)
      .build();
    listing.create();

    await this.listingWriteRepository.save(listing);

    return { id: listing.id.value };
  }
}
