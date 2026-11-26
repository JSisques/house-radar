import { type Collection, defineEntity, type EntityName, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const PROPERTY_ENTITY_NAME = 'PropertyRow';
export const PROPERTY_LISTING_ENTITY_NAME = 'PropertyListingRow';
/** The name typed as an entity reference, as outboxEventEntityName does for the outbox table. */
export const PROPERTY_ENTITY = PROPERTY_ENTITY_NAME as unknown as EntityName<PropertyRow>;
export const PROPERTY_LISTING_ENTITY = PROPERTY_LISTING_ENTITY_NAME as unknown as EntityName<PropertyListingRow>;

export const PropertySchema = defineEntity({
  name: PROPERTY_ENTITY_NAME,
  tableName: 'property',
  schema: 'properties',
  properties: {
    id: p.uuid().primary(),
    /** The listings of the property. Not eager: a lock on the root row must not propagate to them. */
    listings: () => p.oneToMany(PROPERTY_LISTING_ENTITY_NAME as never).mappedBy('property'),
    version: p.integer().version(),
    createdAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export const PropertyListingSchema = defineEntity({
  name: PROPERTY_LISTING_ENTITY_NAME,
  tableName: 'property_listing',
  schema: 'properties',
  properties: {
    id: p.uuid().primary(),
    property: () => p.manyToOne(PROPERTY_ENTITY_NAME as never).fieldName('property_id'),
    listingId: p.uuid(),
    appliedVersion: p.integer(),
    createdAt: p
      .datetime()
      .columnType('timestamptz')
      .onCreate(() => new Date()),
  },
});

/** Row types are written out: the two schemas reference each other, which inference cannot resolve. */
export interface PropertyRow {
  id: string;
  listings: Collection<PropertyListingRow>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyListingRow {
  id: string;
  property: PropertyRow;
  listingId: string;
  appliedVersion: number;
  createdAt: Date;
}
