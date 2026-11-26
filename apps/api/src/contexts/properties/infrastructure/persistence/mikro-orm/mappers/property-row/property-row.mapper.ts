import { Inject, Injectable } from '@nestjs/common';

import { ListingId, PropertyId } from '@house-radar/shared-kernel';

import type { PropertyAggregate } from '@contexts/properties/domain/aggregates/property/property.aggregate';
import {
  type IPropertyBuilderFactory,
  PROPERTY_BUILDER_FACTORY_TOKEN,
} from '@contexts/properties/domain/builders/property/property-builder.factory';
import type { PropertyRow } from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/property.schema';

/** Maps the property aggregate to its table row and back. Its listings live in `property_listing` rows. */
@Injectable()
export class PropertyRowMapper {
  constructor(@Inject(PROPERTY_BUILDER_FACTORY_TOKEN) private readonly builders: IPropertyBuilderFactory) {}

  /** The root row only has an id; the listing rows are registered by the repository's child-row hook. */
  toRow(aggregate: PropertyAggregate): Omit<PropertyRow, 'version' | 'createdAt' | 'updatedAt'> {
    return { id: aggregate.id.value } as Omit<PropertyRow, 'version' | 'createdAt' | 'updatedAt'>;
  }

  toAggregate(row: PropertyRow): PropertyAggregate {
    const builder = this.builders.create().withId(new PropertyId(row.id));
    for (const listing of row.listings.getItems()) {
      builder.withListing(new ListingId(listing.listingId), listing.appliedVersion);
    }
    const aggregate = builder.build();
    aggregate.markPersisted(row.version);
    return aggregate;
  }
}
