import { ListingId } from '@house-radar/shared-kernel';

export interface IProjectListingObservedInput {
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
  readonly listingId: ListingId;
  readonly status: string;
  readonly priceCents: number | null;
  readonly observedAt: Date;

  constructor(input: IProjectListingObservedInput) {
    this.eventId = input.eventId;
    this.listingId = new ListingId(input.listingId);
    this.status = input.status;
    this.priceCents = input.priceCents;
    this.observedAt = input.observedAt;
  }
}
