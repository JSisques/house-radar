import type { MaybePrimitives } from '@house-radar/shared-kernel';

import type { IAdditionalFeaturesPrimitives } from '@contexts/listings/domain/value-objects/additional-features/additional-features';

export interface IListingPrimitives {
  id: string;
  source: string;
  /** Null for a listing without an external id (manual): its identity is the internal UUID. */
  externalId: string | null;
  originalUrl: string;
  addedAt: Date;
  lastCheckedAt: Date;
  status: string;
  title: MaybePrimitives<string>;
  description: MaybePrimitives<string>;
  /** Euro cents. */
  price: MaybePrimitives<number>;
  /** Square meters. */
  builtArea: MaybePrimitives<number>;
  usableArea: MaybePrimitives<number>;
  plotArea: MaybePrimitives<number>;
  bedrooms: MaybePrimitives<number>;
  bathrooms: MaybePrimitives<number>;
  yearBuilt: MaybePrimitives<number>;
  propertyType: MaybePrimitives<string>;
  condition: MaybePrimitives<string>;
  features: IAdditionalFeaturesPrimitives;
}
