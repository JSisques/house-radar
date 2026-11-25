import type { EntityManager } from '@mikro-orm/postgresql';

import type { ProcessedEventContext } from '@core/persistence/processed-event/processed-event.schema.js';

/**
 * Idempotent consumer helper (D31). The claim of `(event_id, consumer)` and the work share one transaction:
 * a crash or failure rolls both back, and a redelivery of a processed event is skipped.
 */
export class IdempotentConsumer {
  constructor(
    private readonly em: EntityManager,
    private readonly context: ProcessedEventContext,
  ) {}

  /** Runs `work` once per event and consumer. Resolves `true` when it ran, `false` when the event was already processed. */
  run(eventId: string, consumer: string, work: () => Promise<void>): Promise<boolean> {
    return this.em.transactional(async (em) => {
      const claimed = await em.execute<{ event_id: string }[]>(
        `insert into "${this.context}"."processed_event" ("event_id", "consumer", "processed_at")
         values (?, ?, now()) on conflict do nothing returning "event_id"`,
        [eventId, consumer],
      );
      if (claimed.length === 0) return false;
      await work();
      return true;
    });
  }
}
