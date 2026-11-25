import { Inject, Injectable } from '@nestjs/common';

import { Criteria } from '@house-radar/building-blocks';
import {
  Area,
  declaredOrUnknown,
  EnergyCertificate,
  known,
  ListingId,
  type ListingUrl,
  PropertyCondition,
  PropertyType,
  type SourceId,
} from '@house-radar/shared-kernel';

import {
  type IListingRegistryPort,
  type IManualListingDetails,
  type IRegisterManualListingInput,
} from '@contexts/ingestion/application/ports/listing-registry.port';
import {
  type IListingBuilderFactory,
  LISTING_BUILDER_FACTORY_TOKEN,
} from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import {
  type IObservationBuilderFactory,
  OBSERVATION_BUILDER_FACTORY_TOKEN,
} from '@contexts/listings/domain/builders/observation/observation-builder.factory';
import {
  type IListingReadRepository,
  LISTING_READ_REPOSITORY,
} from '@contexts/listings/domain/repositories/read/listing-read.repository';
import {
  type IListingWriteRepository,
  LISTING_WRITE_REPOSITORY,
} from '@contexts/listings/domain/repositories/write/listing-write.repository';
import {
  type IObservationWriteRepository,
  OBSERVATION_WRITE_REPOSITORY,
} from '@contexts/listings/domain/repositories/write/observation-write.repository';
import { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';
import { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

/** Adapter to the `listings` context: the only place in `ingestion` that may import it. */
@Injectable()
export class ListingsRegistryAdapter implements IListingRegistryPort {
  constructor(
    @Inject(LISTING_READ_REPOSITORY) private readonly listingRead: IListingReadRepository,
    @Inject(LISTING_WRITE_REPOSITORY) private readonly listingWrite: IListingWriteRepository,
    @Inject(OBSERVATION_WRITE_REPOSITORY) private readonly observationWrite: IObservationWriteRepository,
    @Inject(LISTING_BUILDER_FACTORY_TOKEN) private readonly listingBuilders: IListingBuilderFactory,
    @Inject(OBSERVATION_BUILDER_FACTORY_TOKEN) private readonly observationBuilders: IObservationBuilderFactory,
  ) {}

  async findManualByNormalizedUrl(source: SourceId, url: ListingUrl): Promise<ListingId | null> {
    const criteria = new Criteria()
      .addFilter({ field: 'source', operator: 'eq', value: source.value })
      .addFilter({ field: 'originalUrl', operator: 'eq', value: url.value });
    const { items } = await this.listingRead.findByCriteria(criteria);
    const first = items[0];
    return first === undefined ? null : new ListingId(first.id);
  }

  async registerManual(input: IRegisterManualListingInput): Promise<ListingId> {
    const { details } = input;
    const price = known(input.price, 'declared');
    const listing = this.listingBuilders
      .create()
      .withSource(input.source)
      .withOriginalUrl(input.url)
      .withAddedAt(input.observedAt)
      .withPrice(price)
      .withTitle(declaredOrUnknown(details.title, (v) => new ListingTitle(v)))
      .withDescription(declaredOrUnknown(details.description, (v) => new ListingDescription(v)))
      .withBuiltArea(declaredOrUnknown(details.builtArea, (v) => new Area(v)))
      .withUsableArea(declaredOrUnknown(details.usableArea, (v) => new Area(v)))
      .withPlotArea(declaredOrUnknown(details.plotArea, (v) => new Area(v)))
      .withBedrooms(declaredOrUnknown(details.bedrooms, (v) => new Bedrooms(v)))
      .withBathrooms(declaredOrUnknown(details.bathrooms, (v) => new Bathrooms(v)))
      .withYearBuilt(declaredOrUnknown(details.yearBuilt, (v) => new YearBuilt(v)))
      .withPropertyType(declaredOrUnknown(details.propertyType, (v) => new PropertyType(v)))
      .withCondition(declaredOrUnknown(details.condition, (v) => new PropertyCondition(v)))
      .withFeatures(this.featuresOf(details))
      .build();
    listing.create();
    await this.listingWrite.save(listing);

    const observation = this.observationBuilders
      .create()
      .withListingId(listing.id)
      .withObservedAt(input.observedAt)
      .withPrice(price)
      .build();
    observation.create();
    await this.observationWrite.save(observation);

    return listing.id;
  }

  private featuresOf(details: IManualListingDetails): AdditionalFeatures {
    const f = details.features ?? {};
    return new AdditionalFeatures({
      garage: declaredOrUnknown(f.garage, (v) => v),
      garden: declaredOrUnknown(f.garden, (v) => v),
      swimmingPool: declaredOrUnknown(f.swimmingPool, (v) => v),
      terrace: declaredOrUnknown(f.terrace, (v) => v),
      balcony: declaredOrUnknown(f.balcony, (v) => v),
      heating: declaredOrUnknown(f.heating, (v) => v),
      elevator: declaredOrUnknown(f.elevator, (v) => v),
      energyCertificate: declaredOrUnknown(f.energyCertificate, (v) => new EnergyCertificate(v)),
      landType: declaredOrUnknown(f.landType, (v) => new LandType(v)),
      water: declaredOrUnknown(f.water, (v) => v),
      electricity: declaredOrUnknown(f.electricity, (v) => v),
      sanitation: declaredOrUnknown(f.sanitation, (v) => v),
    });
  }
}
