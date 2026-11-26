import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { CreatePropertyFromListingObservedHandler } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.handler';
import { PROCESSED_EVENT_REPOSITORY_TOKEN } from '@contexts/properties/application/ports/processed-event-repository.port';
import { TRANSACTION_MANAGER_TOKEN } from '@contexts/properties/application/ports/transaction-manager.port';
import {
  PROPERTY_BUILDER_FACTORY_TOKEN,
  PropertyBuilderFactory,
} from '@contexts/properties/domain/builders/property/property-builder.factory';
import { PROPERTY_WRITE_REPOSITORY } from '@contexts/properties/domain/repositories/write/property-write.repository';
import { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed.consumer';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import { ProcessedEventMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/processed-event-mikro-orm/processed-event-mikro-orm.repository';
import { PropertyMikroOrmWriteRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-mikro-orm-write/property-mikro-orm-write.repository';
import { contextOrmProviders } from '@core/persistence/context-orm/context-orm.providers.js';
import { MikroOrmTransactionManager } from '@core/persistence/transaction-manager/mikro-orm-transaction-manager.js';

/** Properties persistence and the consumer of the listings event stream. */
@Module({
  providers: [
    ...contextOrmProviders('properties'),
    PropertyRowMapper,
    CreatePropertyFromListingObservedHandler,
    ListingObservedConsumer,
    { provide: PROPERTY_BUILDER_FACTORY_TOKEN, useClass: PropertyBuilderFactory },
    { provide: PROPERTY_WRITE_REPOSITORY, useClass: PropertyMikroOrmWriteRepository },
    { provide: PROCESSED_EVENT_REPOSITORY_TOKEN, useClass: ProcessedEventMikroOrmRepository },
    {
      provide: TRANSACTION_MANAGER_TOKEN,
      inject: [EntityManager],
      useFactory: (em: EntityManager) => new MikroOrmTransactionManager(em),
    },
  ],
  exports: [ListingObservedConsumer],
})
export class PropertiesModule implements OnApplicationShutdown {
  constructor(@Inject(MikroORM) private readonly orm: MikroORM) {}

  async onApplicationShutdown(): Promise<void> {
    await this.orm.close();
  }
}
