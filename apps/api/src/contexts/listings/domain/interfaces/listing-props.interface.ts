import type { DateValueObject } from '@house-radar/building-blocks';
import type {
  Area,
  ExternalId,
  ListingId,
  ListingUrl,
  Maybe,
  Money,
  PropertyCondition,
  PropertyType,
  SourceId,
} from '@house-radar/shared-kernel';

import type { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import type { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import type { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import type { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import type { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import type { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import type { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

/** What the aggregate constructor needs to hydrate a listing. Unspecified descriptive fields become unknown. */
export interface IListingProps {
  id: ListingId;
  source: SourceId;
  externalId?: ExternalId;
  originalUrl: ListingUrl;
  addedAt: DateValueObject;
  lastCheckedAt: DateValueObject;
  status: ListingStatus;
  title?: Maybe<ListingTitle>;
  description?: Maybe<ListingDescription>;
  price?: Maybe<Money>;
  builtArea?: Maybe<Area>;
  usableArea?: Maybe<Area>;
  plotArea?: Maybe<Area>;
  bedrooms?: Maybe<Bedrooms>;
  bathrooms?: Maybe<Bathrooms>;
  yearBuilt?: Maybe<YearBuilt>;
  propertyType?: Maybe<PropertyType>;
  condition?: Maybe<PropertyCondition>;
  features?: AdditionalFeatures;
}
