import { MikroORM } from '@mikro-orm/postgresql';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { DateValueObject } from '@house-radar/building-blocks';
import {
  InvalidAreaException,
  InvalidEnergyCertificateException,
  InvalidListingUrlException,
  InvalidMoneyException,
  InvalidPropertyConditionException,
  InvalidPropertyTypeException,
} from '@house-radar/shared-kernel';

import { ImportManualListingHandler } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.handler';
import { CLOCK_PORT } from '@contexts/ingestion/application/ports/clock.port';
import { LISTING_REGISTRY_PORT } from '@contexts/ingestion/application/ports/listing-registry.port';
import { AssertManualListingInputService } from '@contexts/ingestion/application/services/assert-manual-listing-input/assert-manual-listing-input.service';
import {
  SOURCE_BUILDER_FACTORY_TOKEN,
  SourceBuilderFactory,
} from '@contexts/ingestion/domain/builders/source/source-builder.factory';
import { DuplicateManualListingException } from '@contexts/ingestion/domain/exceptions/duplicate-manual-listing/duplicate-manual-listing.exception';
import { MissingManualListingFieldsException } from '@contexts/ingestion/domain/exceptions/missing-manual-listing-fields/missing-manual-listing-fields.exception';
import { SOURCE_WRITE_REPOSITORY } from '@contexts/ingestion/domain/repositories/write/source-write.repository';
import { ListingsRegistryAdapter } from '@contexts/ingestion/infrastructure/adapters/listings-registry/listings-registry.adapter';
import { SourceRowMapper } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/mappers/source-row/source-row.mapper';
import { SourceMikroOrmWriteRepository } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/repositories/source-mikro-orm-write/source-mikro-orm-write.repository';
import { ManualListingsController } from '@contexts/ingestion/transport/rest/controllers/manual-listings/manual-listings.controller';
import { ListingsModule } from '@contexts/listings/listings.module';
import { ExceptionMappingRegistry } from '@core/exceptions/exception-mapping/exception-mapping.registry.js';
import { contextOrmProviders } from '@core/persistence/context-orm/context-orm.providers.js';

/** Ingestion: imports listings from outside (manual entry today). */
@Module({
  imports: [ListingsModule],
  controllers: [ManualListingsController],
  providers: [
    ...contextOrmProviders('ingestion'),
    SourceRowMapper,
    AssertManualListingInputService,
    ImportManualListingHandler,
    { provide: SOURCE_BUILDER_FACTORY_TOKEN, useClass: SourceBuilderFactory },
    { provide: SOURCE_WRITE_REPOSITORY, useClass: SourceMikroOrmWriteRepository },
    { provide: LISTING_REGISTRY_PORT, useClass: ListingsRegistryAdapter },
    { provide: CLOCK_PORT, useValue: () => new DateValueObject(new Date()) },
  ],
})
export class IngestionModule implements OnApplicationShutdown {
  constructor(
    @Inject(MikroORM) private readonly orm: MikroORM,
    registry: ExceptionMappingRegistry,
  ) {
    registry.register([
      {
        exception: MissingManualListingFieldsException,
        status: 400,
        code: 'MISSING_MANUAL_LISTING_FIELDS',
        details: (error) => ({ missingFields: (error as MissingManualListingFieldsException).missingFields }),
      },
      {
        exception: DuplicateManualListingException,
        status: 409,
        code: 'DUPLICATE_MANUAL_LISTING',
        details: (error) => ({
          listingId: (error as DuplicateManualListingException).listingId,
          action: 'check_listing',
        }),
      },
      { exception: InvalidListingUrlException, status: 400, code: 'INVALID_LISTING_URL' },
      { exception: InvalidMoneyException, status: 400, code: 'INVALID_PRICE' },
      { exception: InvalidAreaException, status: 400, code: 'INVALID_AREA' },
      { exception: InvalidEnergyCertificateException, status: 400, code: 'INVALID_ENERGY_CERTIFICATE' },
      { exception: InvalidPropertyConditionException, status: 400, code: 'INVALID_PROPERTY_CONDITION' },
      { exception: InvalidPropertyTypeException, status: 400, code: 'INVALID_PROPERTY_TYPE' },
    ]);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.orm.close();
  }
}
