import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ImportManualListingCommand } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command';
import type { ImportManualListingResult } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.result';
import { ImportManualListingDto } from '@contexts/ingestion/transport/rest/dtos/import-manual-listing/import-manual-listing.dto';
import { ListingReferenceDto } from '@contexts/ingestion/transport/rest/dtos/listing-reference/listing-reference.dto';

@ApiTags('listings')
@Controller('listings/manual')
export class ManualListingsController {
  constructor(private readonly commands: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Imports one listing by hand' })
  @ApiCreatedResponse({ description: 'The listing was created', type: ListingReferenceDto })
  @ApiBadRequestResponse({ description: 'Required fields are missing (listed in `details.missingFields`) or invalid' })
  @ApiConflictResponse({
    description: 'The normalized URL is already stored; `details.listingId` references the existing listing',
  })
  async import(@Body() body: ImportManualListingDto): Promise<ListingReferenceDto> {
    const { id } = await this.commands.execute<ImportManualListingCommand, ImportManualListingResult>(
      new ImportManualListingCommand(body),
    );
    return { id };
  }
}
