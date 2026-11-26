export interface ProjectListingObservedCommandInput {
  /** Id of the `ListingObserved` event, used to deduplicate redeliveries. */
  eventId: string;
  listingId: string;
  status: string;
  /** Euro cents; null when the price is unknown. */
  priceCents: number | null;
  observedAt: Date;
}

/** Records the price and status a listing was observed with in the property search view. */
export class ProjectListingObservedCommand {
  readonly eventId: string;
  readonly listingId: string;
  readonly status: string;
  readonly priceCents: number | null;
  readonly observedAt: Date;

  constructor(input: ProjectListingObservedCommandInput) {
    this.eventId = input.eventId;
    this.listingId = input.listingId;
    this.status = input.status;
    this.priceCents = input.priceCents;
    this.observedAt = input.observedAt;
  }
}
