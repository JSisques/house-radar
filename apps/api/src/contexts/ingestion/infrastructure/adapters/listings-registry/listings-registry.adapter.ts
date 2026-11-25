import { Inject, Injectable } from '@nestjs/common';

import { Criteria } from '@house-radar/building-blocks';
import {
  Area,
  EnergyCertificate,
  known,
  ListingId,
  type ListingUrl,
  type Maybe,
  PropertyCondition,
  PropertyType,
  UNKNOWN,
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

const MANUAL_SOURCE = 'manual';

/** Declared by the user: wraps the value when present, unknown otherwise. */
function declared<TIn, TOut>(value: TIn | undefined, build: (value: TIn) => TOut): Maybe<TOut> {
  return value === undefined ? UNKNOWN : known(build(value), 'declared');
}

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

  async findManualByNormalizedUrl(url: ListingUrl): Promise<ListingId | null> {
    const criteria = new Criteria()
      .addFilter({ field: 'source', operator: 'eq', value: MANUAL_SOURCE })
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
      .withTitle(declared(details.title, (v) => new ListingTitle(v)))
      .withDescription(declared(details.description, (v) => new ListingDescription(v)))
      .withBuiltArea(declared(details.builtArea, (v) => new Area(v)))
      .withUsableArea(declared(details.usableArea, (v) => new Area(v)))
      .withPlotArea(declared(details.plotArea, (v) => new Area(v)))
      .withBedrooms(declared(details.bedrooms, (v) => new Bedrooms(v)))
      .withBathrooms(declared(details.bathrooms, (v) => new Bathrooms(v)))
      .withYearBuilt(declared(details.yearBuilt, (v) => new YearBuilt(v)))
      .withPropertyType(declared(details.propertyType, (v) => new PropertyType(v)))
      .withCondition(declared(details.condition, (v) => new PropertyCondition(v)))
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
      garage: declared(f.garage, (v) => v),
      garden: declared(f.garden, (v) => v),
      swimmingPool: declared(f.swimmingPool, (v) => v),
      terrace: declared(f.terrace, (v) => v),
      balcony: declared(f.balcony, (v) => v),
      heating: declared(f.heating, (v) => v),
      elevator: declared(f.elevator, (v) => v),
      energyCertificate: declared(f.energyCertificate, (v) => new EnergyCertificate(v)),
      landType: declared(f.landType, (v) => new LandType(v)),
      water: declared(f.water, (v) => v),
      electricity: declared(f.electricity, (v) => v),
      sanitation: declared(f.sanitation, (v) => v),
    });
  }
}
