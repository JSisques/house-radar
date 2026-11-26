import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { Inject, Module, type OnApplicationShutdown, type Provider } from '@nestjs/common';

import { CreatePropertyFromListingObservedHandler } from '@contexts/properties/application/commands/create-property-from-listing-observed/create-property-from-listing-observed.handler';
import { ProjectListingImportedHandler } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.handler';
import { ProjectListingObservedHandler } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.handler';
import { RebuildPropertySearchViewHandler } from '@contexts/properties/application/commands/rebuild-property-search-view/rebuild-property-search-view.handler';
import { PROCESSED_EVENT_REPOSITORY_TOKEN } from '@contexts/properties/application/ports/processed-event-repository.port';
import { PROJECTED_LISTING_REPOSITORY_TOKEN } from '@contexts/properties/application/ports/projected-listing-repository.port';
import { PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN } from '@contexts/properties/application/ports/property-search-view-repository.port';
import { TRANSACTION_MANAGER_TOKEN } from '@contexts/properties/application/ports/transaction-manager.port';
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/write/property-search-view-refresher/property-search-view-refresher.service';
import {
  PROPERTY_BUILDER_FACTORY_TOKEN,
  PropertyBuilderFactory,
} from '@contexts/properties/domain/builders/property/property-builder.factory';
import { PROPERTY_WRITE_REPOSITORY } from '@contexts/properties/domain/repositories/write/property-write.repository';
import { ListingEventPayloadMapper } from '@contexts/properties/infrastructure/messaging/listing-event-payload/listing-event-payload.mapper';
import { ListingEventsWorker } from '@contexts/properties/infrastructure/messaging/listing-events/listing-events.worker';
import { ListingObservedConsumer } from '@contexts/properties/infrastructure/messaging/listing-observed/listing-observed.consumer';
import { PropertyRowMapper } from '@contexts/properties/infrastructure/persistence/mikro-orm/mappers/property-row/property-row.mapper';
import { ProcessedEventMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/processed-event-mikro-orm/processed-event-mikro-orm.repository';
import { ProjectedListingMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/projected-listing-mikro-orm/projected-listing-mikro-orm.repository';
import { PropertyMikroOrmWriteRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-mikro-orm-write/property-mikro-orm-write.repository';
import { PropertySearchViewMikroOrmRepository } from '@contexts/properties/infrastructure/persistence/mikro-orm/repositories/property-search-view-mikro-orm/property-search-view-mikro-orm.repository';
import { contextOrmProviders } from '@core/persistence/context-orm/context-orm.providers.js';
import { MikroOrmTransactionManager } from '@core/persistence/transaction-manager/mikro-orm-transaction-manager.js';

const COMMAND_HANDLERS: Provider[] = [
  CreatePropertyFromListingObservedHandler,
  ProjectListingImportedHandler,
  ProjectListingObservedHandler,
  RebuildPropertySearchViewHandler,
];

const APPLICATION_SERVICES: Provider[] = [PropertySearchViewRefresherService];

const DOMAIN_BUILDER_FACTORIES: Provider[] = [
  { provide: PROPERTY_BUILDER_FACTORY_TOKEN, useClass: PropertyBuilderFactory },
];

const INFRASTRUCTURE_MAPPERS: Provider[] = [PropertyRowMapper, ListingEventPayloadMapper];

const INFRASTRUCTURE_REPOSITORIES: Provider[] = [
  { provide: PROPERTY_WRITE_REPOSITORY, useClass: PropertyMikroOrmWriteRepository },
  { provide: PROCESSED_EVENT_REPOSITORY_TOKEN, useClass: ProcessedEventMikroOrmRepository },
  { provide: PROJECTED_LISTING_REPOSITORY_TOKEN, useClass: ProjectedListingMikroOrmRepository },
  { provide: PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN, useClass: PropertySearchViewMikroOrmRepository },
];

const INFRASTRUCTURE_ADAPTERS: Provider[] = [
  {
    provide: TRANSACTION_MANAGER_TOKEN,
    inject: [EntityManager],
    useFactory: (em: EntityManager) => new MikroOrmTransactionManager(em),
  },
  ListingObservedConsumer,
  ListingEventsWorker,
];

/** Properties persistence and the consumer of the listings event stream. */
@Module({
  providers: [
    ...contextOrmProviders('properties'),
    ...COMMAND_HANDLERS,
    ...APPLICATION_SERVICES,
    ...DOMAIN_BUILDER_FACTORIES,
    ...INFRASTRUCTURE_MAPPERS,
    ...INFRASTRUCTURE_REPOSITORIES,
    ...INFRASTRUCTURE_ADAPTERS,
  ],
  exports: [ListingObservedConsumer],
})
export class PropertiesModule implements OnApplicationShutdown {
  constructor(@Inject(MikroORM) private readonly orm: MikroORM) {}

  async onApplicationShutdown(): Promise<void> {
    await this.orm.close();
  }
}
