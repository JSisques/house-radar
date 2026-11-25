import { Inject, Injectable } from '@nestjs/common';

import { DateValueObject } from '@house-radar/building-blocks';
import {
  Area,
  type DataOrigin,
  EnergyCertificate,
  ExternalId,
  fromColumn,
  ListingId,
  ListingUrl,
  Money,
  PropertyCondition,
  PropertyType,
  SourceId,
  toColumn,
} from '@house-radar/shared-kernel';

import type { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import {
  type IListingBuilderFactory,
  LISTING_BUILDER_FACTORY_TOKEN,
} from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import { AdditionalFeatures } from '@contexts/listings/domain/value-objects/additional-features/additional-features';
import { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';
import { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';
import type { ListingRow } from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/listing.schema';

/** `numeric` and `bigint` columns are hydrated as strings, so the row keeps them as strings. */
const toBigInt = (value: number | null): bigint | null => (value === null ? null : BigInt(value));

const toDecimal = (value: number | null): string | null => (value === null ? null : String(value));

/** Maps the listing aggregate to its table row and back. `bigint` and `numeric` columns arrive as strings. */
@Injectable()
export class ListingRowMapper {
  constructor(@Inject(LISTING_BUILDER_FACTORY_TOKEN) private readonly builders: IListingBuilderFactory) {}

  toRow(aggregate: ListingAggregate): Omit<ListingRow, 'version' | 'createdAt' | 'updatedAt'> {
    const p = aggregate.toPrimitives();
    const origins: Record<string, DataOrigin> = {};
    return {
      id: p.id,
      sourceId: p.source,
      externalId: p.externalId,
      url: p.originalUrl,
      normalizedUrl: p.originalUrl,
      propertyType: toColumn(p.propertyType, 'propertyType', origins),
      condition: toColumn(p.condition, 'condition', origins),
      builtAreaM2: toDecimal(toColumn(p.builtArea, 'builtArea', origins)),
      usableAreaM2: toDecimal(toColumn(p.usableArea, 'usableArea', origins)),
      plotAreaM2: toDecimal(toColumn(p.plotArea, 'plotArea', origins)),
      bedrooms: toColumn(p.bedrooms, 'bedrooms', origins),
      bathrooms: toColumn(p.bathrooms, 'bathrooms', origins),
      yearBuilt: toColumn(p.yearBuilt, 'yearBuilt', origins),
      hasGarage: toColumn(p.features.garage, 'garage', origins),
      hasGarden: toColumn(p.features.garden, 'garden', origins),
      hasPool: toColumn(p.features.swimmingPool, 'swimmingPool', origins),
      hasTerrace: toColumn(p.features.terrace, 'terrace', origins),
      hasBalcony: toColumn(p.features.balcony, 'balcony', origins),
      hasElevator: toColumn(p.features.elevator, 'elevator', origins),
      hasHeating: toColumn(p.features.heating, 'heating', origins),
      energyCertificate: toColumn(p.features.energyCertificate, 'energyCertificate', origins),
      landType: toColumn(p.features.landType, 'landType', origins),
      hasWater: toColumn(p.features.water, 'water', origins),
      hasElectricity: toColumn(p.features.electricity, 'electricity', origins),
      hasSanitation: toColumn(p.features.sanitation, 'sanitation', origins),
      title: toColumn(p.title, 'title', origins),
      description: toColumn(p.description, 'description', origins),
      currentPriceCents: toBigInt(toColumn(p.price, 'price', origins)),
      origins,
      status: p.status,
      firstSeenAt: p.addedAt,
      lastCheckedAt: p.lastCheckedAt,
    };
  }

  toAggregate(row: ListingRow): ListingAggregate {
    const origins = row.origins;
    const builder = this.builders
      .create()
      .withId(new ListingId(row.id))
      .withSource(new SourceId(row.sourceId))
      .withOriginalUrl(new ListingUrl(row.url))
      .withAddedAt(new DateValueObject(row.firstSeenAt))
      .withLastCheckedAt(new DateValueObject(row.lastCheckedAt))
      .withStatus(new ListingStatus(row.status))
      .withTitle(fromColumn(row.title, 'title', origins, (v) => new ListingTitle(v)))
      .withDescription(fromColumn(row.description, 'description', origins, (v) => new ListingDescription(v)))
      .withPrice(fromColumn(row.currentPriceCents, 'price', origins, (v) => new Money(Number(v))))
      .withBuiltArea(fromColumn(row.builtAreaM2, 'builtArea', origins, (v) => new Area(Number(v))))
      .withUsableArea(fromColumn(row.usableAreaM2, 'usableArea', origins, (v) => new Area(Number(v))))
      .withPlotArea(fromColumn(row.plotAreaM2, 'plotArea', origins, (v) => new Area(Number(v))))
      .withBedrooms(fromColumn(row.bedrooms, 'bedrooms', origins, (v) => new Bedrooms(v)))
      .withBathrooms(fromColumn(row.bathrooms, 'bathrooms', origins, (v) => new Bathrooms(v)))
      .withYearBuilt(fromColumn(row.yearBuilt, 'yearBuilt', origins, (v) => new YearBuilt(v)))
      .withPropertyType(fromColumn(row.propertyType, 'propertyType', origins, (v) => new PropertyType(v)))
      .withCondition(fromColumn(row.condition, 'condition', origins, (v) => new PropertyCondition(v)))
      .withFeatures(
        new AdditionalFeatures({
          garage: fromColumn(row.hasGarage, 'garage', origins, (v) => v),
          garden: fromColumn(row.hasGarden, 'garden', origins, (v) => v),
          swimmingPool: fromColumn(row.hasPool, 'swimmingPool', origins, (v) => v),
          terrace: fromColumn(row.hasTerrace, 'terrace', origins, (v) => v),
          balcony: fromColumn(row.hasBalcony, 'balcony', origins, (v) => v),
          heating: fromColumn(row.hasHeating, 'heating', origins, (v) => v),
          elevator: fromColumn(row.hasElevator, 'elevator', origins, (v) => v),
          energyCertificate: fromColumn(
            row.energyCertificate,
            'energyCertificate',
            origins,
            (v) => new EnergyCertificate(v),
          ),
          landType: fromColumn(row.landType, 'landType', origins, (v) => new LandType(v)),
          water: fromColumn(row.hasWater, 'water', origins, (v) => v),
          electricity: fromColumn(row.hasElectricity, 'electricity', origins, (v) => v),
          sanitation: fromColumn(row.hasSanitation, 'sanitation', origins, (v) => v),
        }),
      );
    if (row.externalId !== null) builder.withExternalId(new ExternalId(row.externalId));
    const aggregate = builder.build();
    aggregate.markPersisted(row.version);
    return aggregate;
  }
}
