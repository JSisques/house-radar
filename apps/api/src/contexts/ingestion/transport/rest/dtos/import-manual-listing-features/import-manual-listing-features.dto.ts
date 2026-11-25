import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/** Optional listing features; whatever is absent stays unknown. */
export class ImportManualListingFeaturesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() garage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() garden?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() swimmingPool?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() terrace?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() balcony?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() heating?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() elevator?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() energyCertificate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() landType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() water?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() electricity?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() sanitation?: boolean;
}
