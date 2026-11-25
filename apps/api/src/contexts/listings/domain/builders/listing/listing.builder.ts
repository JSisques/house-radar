import { Builder, type DateValueObject } from '@house-radar/building-blocks';
import {
  type Area,
  type ExternalId,
  ListingId,
  type ListingUrl,
  type Maybe,
  type Money,
  type PropertyCondition,
  type PropertyType,
  type SourceId,
} from '@house-radar/shared-kernel';

import { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import type { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import type { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import type { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import type { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import type { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import type { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

/**
 * Builds a listing. Optional fields stay unknown. Without an id it gets a fresh UUIDv7, which is
 * the identity of a listing that has no external id; the last check defaults to the date added.
 */
export class ListingBuilder extends Builder<ListingAggregate> {
  private sourceValue?: SourceId;
  private originalUrlValue?: ListingUrl;
  private addedAtValue?: DateValueObject;
  private titleValue?: Maybe<ListingTitle>;
  private descriptionValue?: Maybe<ListingDescription>;
  private priceValue?: Maybe<Money>;
  private builtAreaValue?: Maybe<Area>;
  private usableAreaValue?: Maybe<Area>;
  private plotAreaValue?: Maybe<Area>;
  private bedroomsValue?: Maybe<Bedrooms>;
  private bathroomsValue?: Maybe<Bathrooms>;
  private yearBuiltValue?: Maybe<YearBuilt>;
  private propertyTypeValue?: Maybe<PropertyType>;
  private conditionValue?: Maybe<PropertyCondition>;
  private featuresValue?: AdditionalFeatures;
  private externalIdValue?: ExternalId;
  private lastCheckedAtValue?: DateValueObject;
  private statusValue?: ListingStatus;
  private idValue?: ListingId;

  withSource(source: SourceId): this {
    this.sourceValue = source;
    return this;
  }

  withOriginalUrl(originalUrl: ListingUrl): this {
    this.originalUrlValue = originalUrl;
    return this;
  }

  withAddedAt(addedAt: DateValueObject): this {
    this.addedAtValue = addedAt;
    return this;
  }

  withTitle(title: Maybe<ListingTitle>): this {
    this.titleValue = title;
    return this;
  }

  withDescription(description: Maybe<ListingDescription>): this {
    this.descriptionValue = description;
    return this;
  }

  withPrice(price: Maybe<Money>): this {
    this.priceValue = price;
    return this;
  }

  withBuiltArea(builtArea: Maybe<Area>): this {
    this.builtAreaValue = builtArea;
    return this;
  }

  withUsableArea(usableArea: Maybe<Area>): this {
    this.usableAreaValue = usableArea;
    return this;
  }

  withPlotArea(plotArea: Maybe<Area>): this {
    this.plotAreaValue = plotArea;
    return this;
  }

  withBedrooms(bedrooms: Maybe<Bedrooms>): this {
    this.bedroomsValue = bedrooms;
    return this;
  }

  withBathrooms(bathrooms: Maybe<Bathrooms>): this {
    this.bathroomsValue = bathrooms;
    return this;
  }

  withYearBuilt(yearBuilt: Maybe<YearBuilt>): this {
    this.yearBuiltValue = yearBuilt;
    return this;
  }

  withPropertyType(propertyType: Maybe<PropertyType>): this {
    this.propertyTypeValue = propertyType;
    return this;
  }

  withCondition(condition: Maybe<PropertyCondition>): this {
    this.conditionValue = condition;
    return this;
  }

  withFeatures(features: AdditionalFeatures): this {
    this.featuresValue = features;
    return this;
  }

  withExternalId(externalId: ExternalId): this {
    this.externalIdValue = externalId;
    return this;
  }

  withLastCheckedAt(lastCheckedAt: DateValueObject): this {
    this.lastCheckedAtValue = lastCheckedAt;
    return this;
  }

  withStatus(status: ListingStatus): this {
    this.statusValue = status;
    return this;
  }

  withId(id: ListingId): this {
    this.idValue = id;
    return this;
  }

  protected requiredFields(): Readonly<Record<string, unknown>> {
    return { source: this.sourceValue, originalUrl: this.originalUrlValue, addedAt: this.addedAtValue };
  }

  build(): ListingAggregate {
    this.validate();
    const addedAt = this.addedAtValue as DateValueObject;
    return new ListingAggregate({
      id: this.idValue ?? ListingId.generate(),
      source: this.sourceValue as SourceId,
      externalId: this.externalIdValue,
      originalUrl: this.originalUrlValue as ListingUrl,
      addedAt,
      lastCheckedAt: this.lastCheckedAtValue ?? addedAt,
      status: this.statusValue ?? ListingStatus.active(),
      title: this.titleValue,
      description: this.descriptionValue,
      price: this.priceValue,
      builtArea: this.builtAreaValue,
      usableArea: this.usableAreaValue,
      plotArea: this.plotAreaValue,
      bedrooms: this.bedroomsValue,
      bathrooms: this.bathroomsValue,
      yearBuilt: this.yearBuiltValue,
      propertyType: this.propertyTypeValue,
      condition: this.conditionValue,
      features: this.featuresValue,
    });
  }
}
