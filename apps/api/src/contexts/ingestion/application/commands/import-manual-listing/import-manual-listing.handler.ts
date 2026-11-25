import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { ListingUrl, Money } from '@house-radar/shared-kernel';

import { ImportManualListingCommand } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command';
import type { ImportManualListingResult } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.result';
import { CLOCK_PORT, type IClock } from '@contexts/ingestion/application/ports/clock.port';
import {
  type IListingRegistryPort,
  LISTING_REGISTRY_PORT,
} from '@contexts/ingestion/application/ports/listing-registry.port';
import { AssertManualListingInputService } from '@contexts/ingestion/application/services/assert-manual-listing-input/assert-manual-listing-input.service';
import { DuplicateManualListingException } from '@contexts/ingestion/domain/exceptions/duplicate-manual-listing/duplicate-manual-listing.exception';
import { SourceNotAvailableException } from '@contexts/ingestion/domain/exceptions/source-not-available/source-not-available.exception';
import {
  type ISourceWriteRepository,
  SOURCE_WRITE_REPOSITORY,
} from '@contexts/ingestion/domain/repositories/write/source-write.repository';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

@CommandHandler(ImportManualListingCommand)
export class ImportManualListingHandler implements ICommandHandler<ImportManualListingCommand> {
  constructor(
    @Inject(SOURCE_WRITE_REPOSITORY) private readonly sources: ISourceWriteRepository,
    @Inject(LISTING_REGISTRY_PORT) private readonly registry: IListingRegistryPort,
    @Inject(CLOCK_PORT) private readonly now: IClock,
    private readonly assertInput: AssertManualListingInputService,
  ) {}

  async execute(command: ImportManualListingCommand): Promise<ImportManualListingResult> {
    const input = this.assertInput.execute({ url: command.url, priceCents: command.priceCents });

    const manual = SourceKind.manual();
    const source = await this.sources.findByKind(manual);
    if (source === null || !source.enabled) throw new SourceNotAvailableException(manual.value);

    // The URL is only parsed and normalized, never requested (D17).
    const url = new ListingUrl(input.url);
    const existing = await this.registry.findManualByNormalizedUrl(source.id, url);
    if (existing !== null) throw new DuplicateManualListingException(existing.value);

    const listingId = await this.registry.registerManual({
      source: source.id,
      url,
      price: new Money(input.priceCents),
      observedAt: this.now(),
      details: command.details,
    });
    return { id: listingId.value };
  }
}
