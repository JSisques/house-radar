import { DomainEvent, type EventMetadata } from '@house-radar/building-blocks';

import type { IObservationPrimitives } from '@contexts/listings/domain/primitives/observation.primitives';

/** A listing was seen at a point in time, by a run or by a manual check. */
export class ListingObservedEvent extends DomainEvent {
  constructor(
    metadata: EventMetadata,
    readonly payload: IObservationPrimitives,
  ) {
    super(metadata);
  }
}
