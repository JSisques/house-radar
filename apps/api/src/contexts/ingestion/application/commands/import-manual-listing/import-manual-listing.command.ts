/**
 * Imports one listing by hand. `url` and `price` (in euro cents) are the required fields; they are
 * typed as optional so the handler can report what is missing instead of failing on the first one.
 */
export class ImportManualListingCommand {
  constructor(
    readonly url: string | undefined,
    readonly priceCents: number | undefined,
  ) {}
}
