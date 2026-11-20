// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.command.ts
// The input carries primitives (from transport); the command carries value objects.
// Invalid input fails here, before reaching the handler.
import { ListingUrl, Money } from '@house-radar/shared-kernel';

import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export interface ImportManualListingCommandInput {
  readonly sourceUrl: string;
  readonly title: string;
  readonly priceCents: number;
}

export class ImportManualListingCommand {
  readonly sourceUrl: ListingUrl;
  readonly title: ListingTitle;
  readonly price: Money;

  constructor(input: ImportManualListingCommandInput) {
    this.sourceUrl = new ListingUrl(input.sourceUrl);
    this.title = new ListingTitle(input.title);
    this.price = Money.fromCents(input.priceCents);
  }
}
