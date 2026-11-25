import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ImportManualListingFeaturesDto } from '@contexts/ingestion/transport/rest/dtos/import-manual-listing-features/import-manual-listing-features.dto';

/** Optional descriptive data. Types are checked here; domain rules (ranges, enums) by the domain. */
export class ImportManualListingDetailsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: 'Square meters' }) @IsOptional() @IsNumber() builtArea?: number;
  @ApiPropertyOptional({ description: 'Square meters' }) @IsOptional() @IsNumber() usableArea?: number;
  @ApiPropertyOptional({ description: 'Square meters' }) @IsOptional() @IsNumber() plotArea?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bedrooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bathrooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() yearBuilt?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() propertyType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() condition?: string;

  @ApiPropertyOptional({ type: ImportManualListingFeaturesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportManualListingFeaturesDto)
  features?: ImportManualListingFeaturesDto;
}
