// Path: src/contexts/<context>/application/commands/<verb-noun>/<verb-noun>.command.ts
export interface ImportManualListingCommandInput {
  readonly sourceUrl: string;
  readonly title: string;
  readonly priceCents: number;
}

export class ImportManualListingCommand {
  readonly sourceUrl: string;
  readonly title: string;
  readonly priceCents: number;

  constructor(input: ImportManualListingCommandInput) {
    this.sourceUrl = input.sourceUrl;
    this.title = input.title;
    this.priceCents = input.priceCents;
  }
}
