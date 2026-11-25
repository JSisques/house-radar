import { ApiProperty } from '@nestjs/swagger';

/** Reference to a stored listing. */
export class ListingReferenceDto {
  @ApiProperty({ description: 'Listing id' })
  id!: string;
}
