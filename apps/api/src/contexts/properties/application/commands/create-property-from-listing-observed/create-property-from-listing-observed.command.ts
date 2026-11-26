import { ListingId } from '@house-radar/shared-kernel';

export interface ICreatePropertyFromListingObservedCommandInput {
  /** Id of the `ListingObserved` event, used to deduplicate redeliveries. */
  eventId: string;
  listingId: string;
  /** Aggregate version carried by the event, used to ignore late events. */
  aggregateVersion: number;
}

/** Gives a newly observed listing its own property. */
export class CreatePropertyFromListingObservedCommand {
  readonly eventId: string;
  readonly listingId: ListingId;
  readonly aggregateVersion: number;

  constructor(input: ICreatePropertyFromListingObservedCommandInput) {
    this.eventId = input.eventId;
    this.listingId = new ListingId(input.listingId);
    this.aggregateVersion = input.aggregateVersion;
  }
}
