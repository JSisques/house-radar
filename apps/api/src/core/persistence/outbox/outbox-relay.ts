import type { EntityManager } from '@mikro-orm/postgresql';

import type { OutboxContext } from '@core/persistence/outbox/outbox-event.schema.js';

/** What a handler receives: the outbox row with camelCase names. */
export interface OutboxMessage {
  eventId: string;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  eventType: string;
  schemaVersion: number;
  payload: Record<string, unknown>;
  metadata: { correlationId: string; causationId: string | null };
  occurredAt: Date;
}

export type OutboxDispatcher = (message: OutboxMessage) => Promise<void>;

export interface OutboxRelayResult {
  delivered: number;
  failed: number;
}

interface OutboxSqlRow {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  aggregate_version: number;
  event_type: string;
  schema_version: number;
  payload: Record<string, unknown>;
  metadata: { correlationId: string; causationId: string | null };
  occurred_at: Date | string; // raw queries return timestamptz as text
}

const DEFAULT_BATCH_SIZE = 50;

/**
 * Outbox relay (D31): delivers unpublished `outbox_event` rows of one context to an in-process dispatcher, at least once.
 * Rows are claimed with `FOR UPDATE SKIP LOCKED`, so concurrent relays never take the same row. Events are delivered in
 * occurrence order; the first failure stops the batch, keeps that event and the later ones unpublished, and they are
 * delivered again on the next run. Dispatchers must therefore be idempotent (see `IdempotentConsumer`).
 */
export class OutboxRelay {
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly em: EntityManager,
    private readonly context: OutboxContext,
    private readonly dispatch: OutboxDispatcher,
    private readonly options: { batchSize?: number } = {},
  ) {}

  /** Delivers one batch. Never throws for a handler failure: it is counted in `failed`. */
  runOnce(): Promise<OutboxRelayResult> {
    const table = `"${this.context}"."outbox_event"`;
    return this.em.transactional(async (em) => {
      const rows = await em.execute<OutboxSqlRow[]>(
        `select * from ${table} where "published_at" is null order by "occurred_at", "id" limit ? for update skip locked`,
        [this.options.batchSize ?? DEFAULT_BATCH_SIZE],
      );
      let delivered = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await this.dispatch(toMessage(row));
        } catch {
          failed = 1;
          break;
        }
        await em.execute(`update ${table} set "published_at" = now() where "id" = ?`, [row.id]);
        delivered += 1;
      }
      return { delivered, failed };
    });
  }

  /** Polls until `stop()`. A failed run (for example a lost connection) is skipped and retried on the next tick. */
  start(intervalMs: number): void {
    if (this.timer) return;
    const tick = async (): Promise<void> => {
      await this.runOnce().catch(() => undefined);
      if (this.timer) this.timer = setTimeout(() => void tick(), intervalMs);
    };
    this.timer = setTimeout(() => void tick(), 0);
  }

  stop(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}

function toMessage(row: OutboxSqlRow): OutboxMessage {
  return {
    eventId: row.id,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    aggregateVersion: row.aggregate_version,
    eventType: row.event_type,
    schemaVersion: row.schema_version,
    payload: row.payload,
    metadata: row.metadata,
    occurredAt: new Date(row.occurred_at),
  };
}
