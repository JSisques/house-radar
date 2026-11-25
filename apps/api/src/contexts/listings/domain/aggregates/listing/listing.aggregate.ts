import { AggregateRoot, type DateValueObject, generateEventMetadata } from '@house-radar/building-blocks';
import {
  type Area,
  type ExternalId,
  type ListingId,
  type ListingUrl,
  type Maybe,
  maybeToPrimitives,
  type Money,
  type PropertyCondition,
  type PropertyType,
  type SourceId,
  UNKNOWN,
} from '@house-radar/shared-kernel';

import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import type { IListingProps } from '@contexts/listings/domain/interfaces/listing-props.interface';
import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';
import { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import type { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import type { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import type { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import type { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import type { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import type { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

/**
 * The normalized, source-independent advertisement. Its identity is a UUIDv7; the pair
 * (source, external id) is unique when the external id exists (D23), and a manual listing
 * without one is identified by the UUID alone. Every descriptive field is unknown unless stated.
 */
export class ListingAggregate extends AggregateRoot<ListingId> {
  readonly source: SourceId;
  readonly externalId: ExternalId | undefined;
  readonly originalUrl: ListingUrl;
  readonly addedAt: DateValueObject;
  private _lastCheckedAt: DateValueObject;
  private _status: ListingStatus;
  private _title: Maybe<ListingTitle>;
  private _description: Maybe<ListingDescription>;
  private _price: Maybe<Money>;
  private _builtArea: Maybe<Area>;
  private _usableArea: Maybe<Area>;
  private _plotArea: Maybe<Area>;
  private _bedrooms: Maybe<Bedrooms>;
  private _bathrooms: Maybe<Bathrooms>;
  private _yearBuilt: Maybe<YearBuilt>;
  private _propertyType: Maybe<PropertyType>;
  private _condition: Maybe<PropertyCondition>;
  private _features: AdditionalFeatures;

  constructor(props: IListingProps) {
    super(props.id);
    this.source = props.source;
    this.externalId = props.externalId;
    this.originalUrl = props.originalUrl;
    this.addedAt = props.addedAt;
    this._lastCheckedAt = props.lastCheckedAt;
    this._status = props.status;
    this._title = props.title ?? UNKNOWN;
    this._description = props.description ?? UNKNOWN;
    this._price = props.price ?? UNKNOWN;
    this._builtArea = props.builtArea ?? UNKNOWN;
    this._usableArea = props.usableArea ?? UNKNOWN;
    this._plotArea = props.plotArea ?? UNKNOWN;
    this._bedrooms = props.bedrooms ?? UNKNOWN;
    this._bathrooms = props.bathrooms ?? UNKNOWN;
    this._yearBuilt = props.yearBuilt ?? UNKNOWN;
    this._propertyType = props.propertyType ?? UNKNOWN;
    this._condition = props.condition ?? UNKNOWN;
    this._features = props.features ?? AdditionalFeatures.unknown();
  }

  get lastCheckedAt(): DateValueObject {
    return this._lastCheckedAt;
  }

  get status(): ListingStatus {
    return this._status;
  }

  get title(): Maybe<ListingTitle> {
    return this._title;
  }

  get description(): Maybe<ListingDescription> {
    return this._description;
  }

  get price(): Maybe<Money> {
    return this._price;
  }

  get builtArea(): Maybe<Area> {
    return this._builtArea;
  }

  get usableArea(): Maybe<Area> {
    return this._usableArea;
  }

  get plotArea(): Maybe<Area> {
    return this._plotArea;
  }

  get bedrooms(): Maybe<Bedrooms> {
    return this._bedrooms;
  }

  get bathrooms(): Maybe<Bathrooms> {
    return this._bathrooms;
  }

  get yearBuilt(): Maybe<YearBuilt> {
    return this._yearBuilt;
  }

  get propertyType(): Maybe<PropertyType> {
    return this._propertyType;
  }

  get condition(): Maybe<PropertyCondition> {
    return this._condition;
  }

  get features(): AdditionalFeatures {
    return this._features;
  }

  /** Records that the listing entered the system. */
  create(): void {
    this.record(new ListingImportedEvent(generateEventMetadata(), this.toPrimitives()));
  }

  toPrimitives(): IListingPrimitives {
    return {
      id: this.id.value,
      source: this.source.value,
      externalId: this.externalId?.value ?? null,
      originalUrl: this.originalUrl.value,
      addedAt: this.addedAt.value,
      lastCheckedAt: this._lastCheckedAt.value,
      status: this._status.value,
      title: maybeToPrimitives(this._title, (v) => v.value),
      description: maybeToPrimitives(this._description, (v) => v.value),
      price: maybeToPrimitives(this._price, (v) => v.cents),
      builtArea: maybeToPrimitives(this._builtArea, (v) => v.squareMeters),
      usableArea: maybeToPrimitives(this._usableArea, (v) => v.squareMeters),
      plotArea: maybeToPrimitives(this._plotArea, (v) => v.squareMeters),
      bedrooms: maybeToPrimitives(this._bedrooms, (v) => v.value),
      bathrooms: maybeToPrimitives(this._bathrooms, (v) => v.value),
      yearBuilt: maybeToPrimitives(this._yearBuilt, (v) => v.value),
      propertyType: maybeToPrimitives(this._propertyType, (v) => v.value),
      condition: maybeToPrimitives(this._condition, (v) => v.value),
      features: this._features.toPrimitives(),
    };
  }
}
