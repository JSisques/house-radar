import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';

export interface ProjectListingImportedCommandInput {
  /** Id of the `ListingImported` event, used to deduplicate redeliveries. */
  eventId: string;
  listingId: string;
  source: string;
  status: string;
  /** Euro cents; null when the price is unknown. */
  priceCents: number | null;
  attributes: ListingAttributes;
  /** When the listing was last checked: the moment its attributes were observed. */
  observedAt: Date;
}

/** Records the attributes of an imported listing in the property search view. */
export class ProjectListingImportedCommand {
  readonly eventId: string;
  readonly listingId: string;
  readonly source: string;
  readonly status: string;
  readonly priceCents: number | null;
  readonly attributes: ListingAttributes;
  readonly observedAt: Date;

  constructor(input: ProjectListingImportedCommandInput) {
    this.eventId = input.eventId;
    this.listingId = input.listingId;
    this.source = input.source;
    this.status = input.status;
    this.priceCents = input.priceCents;
    this.attributes = input.attributes;
    this.observedAt = input.observedAt;
  }
}
