import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

import { ImportManualListingCommand } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command';
import type { ImportManualListingResult } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.result';
import { CLOCK_PORT, type IClock } from '@contexts/ingestion/application/ports/clock.port';
import {
  type IListingRegistryPort,
  LISTING_REGISTRY_PORT,
} from '@contexts/ingestion/application/ports/listing-registry.port';
import { SourceNotAvailableException } from '@contexts/ingestion/domain/exceptions/source-not-available/source-not-available.exception';
import {
  type ISourceWriteRepository,
  SOURCE_WRITE_REPOSITORY,
} from '@contexts/ingestion/domain/repositories/write/source-write.repository';

const MANUAL_SOURCE_ID = 'manual';

const isBlank = (value: string | undefined): boolean => value === undefined || value.trim() === '';

@CommandHandler(ImportManualListingCommand)
export class ImportManualListingHandler implements ICommandHandler<ImportManualListingCommand> {
  constructor(
    @Inject(SOURCE_WRITE_REPOSITORY) private readonly sources: ISourceWriteRepository,
    @Inject(LISTING_REGISTRY_PORT) private readonly registry: IListingRegistryPort,
    @Inject(CLOCK_PORT) private readonly now: IClock,
  ) {}

  async execute(command: ImportManualListingCommand): Promise<ImportManualListingResult> {
    const missingFields: string[] = [];
    if (isBlank(command.url)) missingFields.push('url');
    if (command.priceCents === undefined || command.priceCents === null) missingFields.push('price');
    if (missingFields.length > 0) return { status: 'invalid', missingFields };

    const sourceId = new SourceId(MANUAL_SOURCE_ID);
    const source = await this.sources.findById(sourceId);
    if (source === null || !source.enabled) throw new SourceNotAvailableException(MANUAL_SOURCE_ID);

    // The URL is only parsed and normalized, never requested (D17).
    const url = new ListingUrl(command.url as string);
    const existing = await this.registry.findManualByNormalizedUrl(url);
    if (existing !== null) return { status: 'duplicate', listingId: existing.value, action: 'check_listing' };

    const listingId = await this.registry.registerManual({
      source: sourceId,
      url,
      price: new Money(command.priceCents as number),
      observedAt: this.now(),
      details: command.details,
    });
    return { status: 'created', listingId: listingId.value };
  }
}
