import { defineEntity, type EntityName, type InferEntity, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const PROJECTED_LISTING_ENTITY_NAME = 'ProjectedListingRow';
export const PROPERTY_SEARCH_VIEW_ENTITY_NAME = 'PropertySearchViewRow';

/** Per-listing state as last applied by the projections. */
export const ProjectedListingSchema = defineEntity({
  name: PROJECTED_LISTING_ENTITY_NAME,
  tableName: 'projected_listing',
  schema: 'properties',
  properties: {
    listingId: p.uuid().primary(),
    source: p.text().strictNullable(),
    status: p.text().strictNullable(),
    priceCents: p.bigint('number').strictNullable(),
    stateObservedAt: p.datetime().columnType('timestamptz').strictNullable(),
    attributes: p.json<Record<string, string | number | boolean>>().columnType('jsonb').strictNullable(),
    attributesObservedAt: p.datetime().columnType('timestamptz').strictNullable(),
    createdAt: p.datetime().columnType('timestamptz'),
    updatedAt: p.datetime().columnType('timestamptz'),
  },
});

/** Consolidated read model of a property (D19, D20). */
export const PropertySearchViewSchema = defineEntity({
  name: PROPERTY_SEARCH_VIEW_ENTITY_NAME,
  tableName: 'property_search_view',
  schema: 'properties',
  properties: {
    propertyId: p.uuid().primary(),
    title: p.text().strictNullable(),
    description: p.text().strictNullable(),
    propertyType: p.text().strictNullable(),
    condition: p.text().strictNullable(),
    builtAreaM2: p.decimal('number').fieldName('built_area_m2').columnType('numeric(10,2)').strictNullable(),
    usableAreaM2: p.decimal('number').fieldName('usable_area_m2').columnType('numeric(10,2)').strictNullable(),
    plotAreaM2: p.decimal('number').fieldName('plot_area_m2').columnType('numeric(12,2)').strictNullable(),
    bedrooms: p.integer().strictNullable(),
    bathrooms: p.integer().strictNullable(),
    yearBuilt: p.integer().strictNullable(),
    features: p.json<Record<string, string | number | boolean>>().columnType('jsonb').default('{}'),
    conflicts: p.json<Record<string, unknown>>().columnType('jsonb').default('{}'),
    representativePriceCents: p.bigint('number').strictNullable(),
    pricePerM2Cents: p.bigint('number').fieldName('price_per_m2_cents').strictNullable(),
    activeListingCount: p.integer(),
    listingCount: p.integer(),
    lastUpdatedAt: p.datetime().columnType('timestamptz'),
  },
});

export type ProjectedListingRow = InferEntity<typeof ProjectedListingSchema>;
export type PropertySearchViewRow = InferEntity<typeof PropertySearchViewSchema>;

/** The names typed as entity references, as `PROPERTY_ENTITY` does for the property table. */
export const PROJECTED_LISTING_ENTITY = PROJECTED_LISTING_ENTITY_NAME as unknown as EntityName<ProjectedListingRow>;
export const PROPERTY_SEARCH_VIEW_ENTITY =
  PROPERTY_SEARCH_VIEW_ENTITY_NAME as unknown as EntityName<PropertySearchViewRow>;
