import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ImportManualListingDetailsDto } from '@contexts/ingestion/transport/rest/dtos/import-manual-listing-details/import-manual-listing-details.dto';

/**
 * `url` and `priceCents` are required, but declared optional here on purpose: presence is asserted by the
 * application, so a request missing both reports both (HR-F001-AC2) instead of failing on the first.
 */
export class ImportManualListingDto {
  @ApiPropertyOptional({ description: 'Required. Listing URL; it is stored, never fetched.' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Required. Asking price in euro cents.', example: 25000000 })
  @IsOptional()
  @IsInt()
  priceCents?: number;

  @ApiPropertyOptional({ type: ImportManualListingDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportManualListingDetailsDto)
  details?: ImportManualListingDetailsDto;
}
