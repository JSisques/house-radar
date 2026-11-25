import { MikroORM } from '@mikro-orm/postgresql';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import {
  LISTING_BUILDER_FACTORY_TOKEN,
  ListingBuilderFactory,
} from '@contexts/listings/domain/builders/listing/listing-builder.factory';
import {
  OBSERVATION_BUILDER_FACTORY_TOKEN,
  ObservationBuilderFactory,
} from '@contexts/listings/domain/builders/observation/observation-builder.factory';
import { LISTING_READ_REPOSITORY } from '@contexts/listings/domain/repositories/read/listing-read.repository';
import { LISTING_WRITE_REPOSITORY } from '@contexts/listings/domain/repositories/write/listing-write.repository';
import { OBSERVATION_WRITE_REPOSITORY } from '@contexts/listings/domain/repositories/write/observation-write.repository';
import { ListingRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/listing-row/listing-row.mapper';
import { ObservationRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/observation-row/observation-row.mapper';
import { ListingMikroOrmReadRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-read/listing-mikro-orm-read.repository';
import { ListingMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/listing-mikro-orm-write/listing-mikro-orm-write.repository';
import { ObservationMikroOrmWriteRepository } from '@contexts/listings/infrastructure/persistence/mikro-orm/repositories/observation-mikro-orm-write/observation-mikro-orm-write.repository';
import { contextOrmProviders } from '@core/persistence/context-orm/context-orm.providers.js';

/** Listings persistence. Exports what other contexts' adapters need to register a listing. */
@Module({
  providers: [
    ...contextOrmProviders('listings'),
    ListingRowMapper,
    ObservationRowMapper,
    { provide: LISTING_BUILDER_FACTORY_TOKEN, useClass: ListingBuilderFactory },
    { provide: OBSERVATION_BUILDER_FACTORY_TOKEN, useClass: ObservationBuilderFactory },
    { provide: LISTING_READ_REPOSITORY, useClass: ListingMikroOrmReadRepository },
    { provide: LISTING_WRITE_REPOSITORY, useClass: ListingMikroOrmWriteRepository },
    { provide: OBSERVATION_WRITE_REPOSITORY, useClass: ObservationMikroOrmWriteRepository },
  ],
  exports: [
    LISTING_BUILDER_FACTORY_TOKEN,
    OBSERVATION_BUILDER_FACTORY_TOKEN,
    LISTING_READ_REPOSITORY,
    LISTING_WRITE_REPOSITORY,
    OBSERVATION_WRITE_REPOSITORY,
  ],
})
export class ListingsModule implements OnApplicationShutdown {
  constructor(@Inject(MikroORM) private readonly orm: MikroORM) {}

  async onApplicationShutdown(): Promise<void> {
    await this.orm.close();
  }
}
