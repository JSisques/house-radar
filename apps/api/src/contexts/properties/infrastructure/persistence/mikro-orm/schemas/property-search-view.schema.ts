import { defineEntity, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.
// Both tables are written with raw SQL by the repositories, which cast every column they read; the schemas keep
// the tables known to the schema diff, so a generated migration never drops them.

/** Per-listing state as last applied by the projections. */
export const ProjectedListingSchema = defineEntity({
  name: 'ProjectedListingRow',
  tableName: 'projected_listing',
  schema: 'properties',
  properties: {
    listingId: p.uuid().primary(),
    source: p.text().strictNullable(),
    status: p.text().strictNullable(),
    priceCents: p.bigint().strictNullable(),
    stateObservedAt: p.datetime().columnType('timestamptz').strictNullable(),
    attributes: p.json<Record<string, string | number | boolean>>().columnType('jsonb').strictNullable(),
    attributesObservedAt: p.datetime().columnType('timestamptz').strictNullable(),
    createdAt: p.datetime().columnType('timestamptz'),
    updatedAt: p.datetime().columnType('timestamptz'),
  },
});

/** Consolidated read model of a property (D19, D20). */
export const PropertySearchViewSchema = defineEntity({
  name: 'PropertySearchViewRow',
  tableName: 'property_search_view',
  schema: 'properties',
  properties: {
    propertyId: p.uuid().primary(),
    title: p.text().strictNullable(),
    description: p.text().strictNullable(),
    propertyType: p.text().strictNullable(),
    condition: p.text().strictNullable(),
    builtAreaM2: p.decimal().columnType('numeric(10,2)').strictNullable(),
    usableAreaM2: p.decimal().columnType('numeric(10,2)').strictNullable(),
    plotAreaM2: p.decimal().columnType('numeric(12,2)').strictNullable(),
    bedrooms: p.integer().strictNullable(),
    bathrooms: p.integer().strictNullable(),
    yearBuilt: p.integer().strictNullable(),
    features: p.json().columnType('jsonb').default('{}'),
    conflicts: p.json().columnType('jsonb').default('{}'),
    representativePriceCents: p.bigint().strictNullable(),
    pricePerM2Cents: p.bigint().strictNullable(),
    activeListingCount: p.integer(),
    listingCount: p.integer(),
    lastUpdatedAt: p.datetime().columnType('timestamptz'),
  },
});
