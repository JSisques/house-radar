import { defineEntity, type EntityName, type InferEntity, p } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Origin of every known attribute, keyed by attribute name. Unknown attributes have no entry. */
export type ListingOriginsRecord = Record<string, 'declared' | 'calculated' | 'inferred'>;

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const LISTING_ENTITY_NAME = 'ListingRow';
/** The name typed as an entity reference, as outboxEventEntityName does for the outbox table. */
export const LISTING_ENTITY = LISTING_ENTITY_NAME as unknown as EntityName<ListingRow>;

export const ListingSchema = defineEntity({
  name: LISTING_ENTITY_NAME,
  tableName: 'listing',
  schema: 'listings',
  properties: {
    id: p.uuid().primary(),
    sourceId: p.text(),
    externalId: p.text().strictNullable(),
    url: p.text(),
    normalizedUrl: p.text(),
    propertyType: p.text().strictNullable(),
    condition: p.text().strictNullable(),
    builtAreaM2: p.decimal('string').columnType('numeric').strictNullable(),
    usableAreaM2: p.decimal('string').columnType('numeric').strictNullable(),
    plotAreaM2: p.decimal('string').columnType('numeric').strictNullable(),
    bedrooms: p.integer().strictNullable(),
    bathrooms: p.integer().strictNullable(),
    yearBuilt: p.integer().strictNullable(),
    hasGarage: p.boolean().strictNullable(),
    hasGarden: p.boolean().strictNullable(),
    hasPool: p.boolean().strictNullable(),
    hasTerrace: p.boolean().strictNullable(),
    hasBalcony: p.boolean().strictNullable(),
    hasElevator: p.boolean().strictNullable(),
    hasHeating: p.boolean().strictNullable(),
    energyCertificate: p.text().strictNullable(),
    landType: p.text().strictNullable(),
    hasWater: p.boolean().strictNullable(),
    hasElectricity: p.boolean().strictNullable(),
    hasSanitation: p.boolean().strictNullable(),
    title: p.text().strictNullable(),
    description: p.text().strictNullable(),
    currentPriceCents: p.bigint().strictNullable(),
    origins: p.json<ListingOriginsRecord>().columnType('jsonb'),
    status: p.text(),
    firstSeenAt: p.datetime().columnType('timestamptz'),
    lastCheckedAt: p.datetime().columnType('timestamptz'),
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

export type ListingRow = InferEntity<typeof ListingSchema>;
