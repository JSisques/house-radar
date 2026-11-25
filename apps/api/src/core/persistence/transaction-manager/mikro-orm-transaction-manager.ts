import type { EntityManager } from '@mikro-orm/postgresql';

import type { ITransactionManager } from './transaction-manager.port.js';

export class MikroOrmTransactionManager implements ITransactionManager {
  constructor(private readonly em: EntityManager) {}

  run<T>(fn: () => Promise<T>): Promise<T> {
    return this.em.transactional(fn);
  }
}
