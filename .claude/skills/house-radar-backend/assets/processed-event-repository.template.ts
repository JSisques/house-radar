// Path: src/contexts/<context>/infrastructure/persistence/mikro-orm/repositories/processed-event-mikroorm.repository.ts
// Infrastructure implementation of the IProcessedEventRepository port.
// `claim` runs on the ambient transaction opened by ITransactionManager.run, so the claim and the
// projection writes commit or roll back together.
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';
import { ProcessedEventEntity } from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/processed-event.schema';

@Injectable()
export class ProcessedEventMikroormRepository implements IProcessedEventRepository {
  // MikroORM's request-scoped EntityManager is forked per transaction by MikroormTransactionManager
  // (`em.transactional(fn)`), which is the implementation of ITransactionManager.
  constructor(private readonly em: EntityManager) {}

  /** true when this (eventId, consumer) pair was claimed now; false when it already existed. */
  async claim(eventId: string, consumer: string): Promise<boolean> {
    const result = await this.em
      .createQueryBuilder(ProcessedEventEntity)
      .insert({ eventId, consumer, processedAt: new Date() })
      .onConflict(['eventId', 'consumer'])
      .ignore() // INSERT ... ON CONFLICT DO NOTHING
      .execute('run');
    return result.affectedRows === 1;
  }
}

// ITransactionManager implementation, same folder:
//   async run<T>(fn: () => Promise<T>): Promise<T> { return this.em.transactional(fn); }
