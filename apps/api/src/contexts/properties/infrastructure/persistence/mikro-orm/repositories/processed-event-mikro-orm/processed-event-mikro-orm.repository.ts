import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';

/**
 * Claims events in `properties.processed_event`. The insert runs in the ambient transaction, so the claim and the
 * work it guards commit or roll back together (D31).
 */
@Injectable()
export class ProcessedEventMikroOrmRepository implements IProcessedEventRepository {
  constructor(@Inject(EntityManager) private readonly em: EntityManager) {}

  async claim(eventId: string, consumer: string): Promise<boolean> {
    const claimed = await this.em.execute<{ event_id: string }[]>(
      `insert into "properties"."processed_event" ("event_id", "consumer", "processed_at")
       values (?, ?, now()) on conflict do nothing returning "event_id"`,
      [eventId, consumer],
    );
    return claimed.length > 0;
  }
}
