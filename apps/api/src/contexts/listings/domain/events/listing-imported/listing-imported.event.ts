import { DomainEvent, type EventMetadata } from '@house-radar/building-blocks';

import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';

/** A listing entered the system, from a source or by hand. */
export class ListingImportedEvent extends DomainEvent {
  constructor(
    metadata: EventMetadata,
    readonly payload: IListingPrimitives,
  ) {
    super(metadata);
  }
}
