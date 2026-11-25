import type { IManualListingDetails } from '@contexts/ingestion/application/ports/listing-registry.port';

/**
 * `url` and `priceCents` (euro cents) are the required fields; they are typed as optional so the
 * handler can report what is missing instead of failing on the first one. Everything in `details`
 * is optional and stays unknown when absent.
 */
export interface IImportManualListingCommandInput {
  url?: string;
  priceCents?: number;
  details?: IManualListingDetails;
}

/** Imports one listing by hand. */
export class ImportManualListingCommand {
  readonly url: string | undefined;
  readonly priceCents: number | undefined;
  readonly details: IManualListingDetails;

  constructor(input: IImportManualListingCommandInput) {
    this.url = input.url;
    this.priceCents = input.priceCents;
    this.details = input.details ?? {};
  }
}
