export type ImportManualListingResult =
  | { status: 'created'; listingId: string }
  /** The normalized URL is already stored: warn the user and offer to check that listing. */
  | { status: 'duplicate'; listingId: string; action: 'check_listing' }
  | { status: 'invalid'; missingFields: string[] };
