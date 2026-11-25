import { type EntityName, EntitySchema } from '@mikro-orm/core';

// Discovery loads this file natively, so it imports packages (resolved by Node) and not aliases.

/** Origin of every known attribute, keyed by attribute name. Unknown attributes have no entry. */
export type ListingOriginsRecord = Record<string, 'declared' | 'calculated' | 'inferred'>;

export interface ListingRow {
  id: string;
  sourceId: string;
  externalId: string | null;
  url: string;
  normalizedUrl: string;
  propertyType: string | null;
  condition: string | null;
  builtAreaM2: string | null;
  usableAreaM2: string | null;
  plotAreaM2: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  hasGarage: boolean | null;
  hasGarden: boolean | null;
  hasPool: boolean | null;
  hasTerrace: boolean | null;
  hasBalcony: boolean | null;
  hasElevator: boolean | null;
  hasHeating: boolean | null;
  energyCertificate: string | null;
  landType: string | null;
  hasWater: boolean | null;
  hasElectricity: boolean | null;
  hasSanitation: boolean | null;
  title: string | null;
  description: string | null;
  currentPriceCents: bigint | null;
  origins: ListingOriginsRecord;
  status: string;
  firstSeenAt: Date;
  lastCheckedAt: Date;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Entities are resolved by name: discovery loads this file in its own module instance. */
export const LISTING_ENTITY_NAME = 'ListingRow';
/** The name typed as an entity reference, as outboxEventEntityName does for the outbox table. */
export const LISTING_ENTITY = LISTING_ENTITY_NAME as unknown as EntityName<ListingRow>;

export const ListingSchema = new EntitySchema<ListingRow>({
  name: LISTING_ENTITY_NAME,
  tableName: 'listing',
  schema: 'listings',
  properties: {
    id: { type: 'uuid', primary: true },
    sourceId: { type: 'string', columnType: 'text' },
    externalId: { type: 'string', columnType: 'text', nullable: true },
    url: { type: 'string', columnType: 'text' },
    normalizedUrl: { type: 'string', columnType: 'text' },
    propertyType: { type: 'string', columnType: 'text', nullable: true },
    condition: { type: 'string', columnType: 'text', nullable: true },
    builtAreaM2: { type: 'string', columnType: 'numeric', nullable: true },
    usableAreaM2: { type: 'string', columnType: 'numeric', nullable: true },
    plotAreaM2: { type: 'string', columnType: 'numeric', nullable: true },
    bedrooms: { type: 'integer', nullable: true },
    bathrooms: { type: 'integer', nullable: true },
    yearBuilt: { type: 'integer', nullable: true },
    hasGarage: { type: 'boolean', nullable: true },
    hasGarden: { type: 'boolean', nullable: true },
    hasPool: { type: 'boolean', nullable: true },
    hasTerrace: { type: 'boolean', nullable: true },
    hasBalcony: { type: 'boolean', nullable: true },
    hasElevator: { type: 'boolean', nullable: true },
    hasHeating: { type: 'boolean', nullable: true },
    energyCertificate: { type: 'string', columnType: 'text', nullable: true },
    landType: { type: 'string', columnType: 'text', nullable: true },
    hasWater: { type: 'boolean', nullable: true },
    hasElectricity: { type: 'boolean', nullable: true },
    hasSanitation: { type: 'boolean', nullable: true },
    title: { type: 'string', columnType: 'text', nullable: true },
    description: { type: 'string', columnType: 'text', nullable: true },
    currentPriceCents: { type: 'bigint', nullable: true },
    origins: { type: 'json', columnType: 'jsonb' },
    status: { type: 'string', columnType: 'text' },
    firstSeenAt: { type: 'Date', columnType: 'timestamptz' },
    lastCheckedAt: { type: 'Date', columnType: 'timestamptz' },
    version: { type: 'integer', version: true },
    createdAt: { type: 'Date', columnType: 'timestamptz', onCreate: () => new Date() },
    updatedAt: { type: 'Date', columnType: 'timestamptz', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});
