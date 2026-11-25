import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import type { Provider } from '@nestjs/common';

import { AppConfig } from '@core/config/app-config/app-config.js';
import { createOrmOptions, type MigrationStream } from '@core/persistence/orm-config/orm-config.js';

/**
 * Module-scoped `MikroORM` and `EntityManager` providers for one context stream. Every context module
 * provides its own pair, so a context only ever sees its own schema's entities.
 */
export function contextOrmProviders(stream: Exclude<MigrationStream, 'core'>): Provider[] {
  return [
    {
      provide: MikroORM,
      inject: [AppConfig],
      useFactory: (config: AppConfig) => MikroORM.init(createOrmOptions(stream, config.databaseUrl)),
    },
    { provide: EntityManager, inject: [MikroORM], useFactory: (orm: MikroORM) => orm.em },
  ];
}
