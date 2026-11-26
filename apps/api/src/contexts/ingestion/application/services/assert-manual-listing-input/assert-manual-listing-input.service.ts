import { Injectable } from '@nestjs/common';

import { IService } from '@house-radar/building-blocks';
import { isBlank } from '@house-radar/shared-kernel';

import { MissingManualListingFieldsException } from '@contexts/ingestion/domain/exceptions/missing-manual-listing-fields/missing-manual-listing-fields.exception';

export interface IManualListingServiceInput {
  url?: string;
  priceCents?: number;
}

export interface IValidManualListingInput {
  url: string;
  priceCents: number;
}

/** Ensures every required manual listing field is present, reporting all missing ones at once. */
@Injectable()
export class AssertManualListingInputService implements IService<IManualListingServiceInput, IValidManualListingInput> {
  execute(input: IManualListingServiceInput): IValidManualListingInput {
    const missingFields: string[] = [];
    if (isBlank(input.url)) missingFields.push('url');
    if (input.priceCents === undefined || input.priceCents === null) missingFields.push('price');
    if (missingFields.length > 0) throw new MissingManualListingFieldsException(missingFields);
    return { url: input.url as string, priceCents: input.priceCents as number };
  }
}
