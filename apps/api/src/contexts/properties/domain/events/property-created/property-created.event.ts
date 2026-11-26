import { DomainEvent, type EventMetadata } from '@house-radar/building-blocks';

import type { IPropertyPrimitives } from '@contexts/properties/domain/primitives/property.primitives';

/** A property came into existence, for now always from the first observation of a listing. */
export class PropertyCreatedEvent extends DomainEvent {
  constructor(
    metadata: EventMetadata,
    readonly payload: IPropertyPrimitives,
  ) {
    super(metadata);
  }
}
