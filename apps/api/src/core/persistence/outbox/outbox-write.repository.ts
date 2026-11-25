import { type EntityManager, type EntityName, LockMode, OptimisticLockError } from '@mikro-orm/core';

import {
  type AggregateRoot,
  type DomainEvent,
  generateUuidV7,
  type IWriteRepository,
  type ValueObject,
} from '@house-radar/building-blocks';
import { type OutboxContext, outboxEventEntityName, type OutboxEventRow } from '@house-radar/outbox';

import { OptimisticLockException } from '@core/persistence/optimistic-lock/optimistic-lock.exception.js';

export interface OutboxWriteRepositoryOptions<TRow> {
  /** Schema of the aggregate's table. It must map an integer `version` property with `version: true`. */
  entity: EntityName<TRow>;
  /** Context whose `outbox_event` table receives the events. */
  outboxSchema: OutboxContext;
  aggregateType: string;
}

/**
 * Write repository base (D31): the aggregate row and its recorded events are stored in one transaction.
 * The buffer is cleared and the version synced only after the commit, so a failed save can be retried.
 * `save()` is the transaction boundary: inside an outer `ITransactionManager.run` it joins that transaction and clears
 * the buffer before the outer commit, so after an outer rollback discard and reload the aggregate instead of retrying.
 */
export abstract class OutboxWriteRepository<
  TId extends ValueObject<unknown, unknown> & { value: string },
  TAggregate extends AggregateRoot<TId>,
  TRow extends { id: string; version: number },
> implements IWriteRepository<TId, TAggregate> {
  protected constructor(
    protected readonly em: EntityManager,
    private readonly options: OutboxWriteRepositoryOptions<TRow>,
  ) {}

  /** The aggregate state to store, without the version: the database owns it. */
  protected abstract toRow(aggregate: TAggregate): Omit<TRow, 'version'>;

  protected abstract toAggregate(row: TRow): TAggregate;

  async save(aggregate: TAggregate): Promise<void> {
    const events = aggregate.peekDomainEvents();
    let version: number;
    let id = aggregate.id.value;
    try {
      version = await this.em.transactional(async (em) => {
        const row = aggregate.isNew() ? await this.upsertRow(em, aggregate) : await this.lockRow(em, aggregate);
        id = row.id;
        await em.flush();
        for (const event of events) {
          await em.insert(
            outboxEventEntityName(this.options.outboxSchema) as unknown as EntityName<OutboxEventRow>,
            this.toOutboxRow(id, row.version, event),
          );
        }
        return row.version;
      });
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw new OptimisticLockException(this.options.aggregateType, id, { cause: error });
      }
      throw error;
    }
    aggregate.clearDomainEvents();
    aggregate.markPersisted(version);
  }

  async findById(id: TId): Promise<TAggregate | null> {
    const row = await this.em.fork().findOne(this.options.entity, { id: id.value } as never);
    return row === null ? null : this.toAggregate(row as TRow);
  }

  async delete(id: TId): Promise<void> {
    await this.em.nativeDelete(this.options.entity, { id: id.value } as never);
  }

  /**
   * Natural-key hook for upserts: a new aggregate whose natural key already has a row updates that row (keeping its id)
   * instead of inserting. The default has no natural key, so a new aggregate is always inserted.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- parameters document the hook for overrides
  protected findRowByNaturalKey(_em: EntityManager, _aggregate: TAggregate): Promise<TRow | null> {
    return Promise.resolve(null);
  }

  private async upsertRow(em: EntityManager, aggregate: TAggregate): Promise<TRow> {
    const existing = await this.findRowByNaturalKey(em, aggregate);
    if (existing === null) return this.insertRow(em, aggregate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the id of the existing row is kept
    const { id: _id, ...state } = this.toRow(aggregate);
    return em.assign(existing, state as never) as TRow;
  }

  private insertRow(em: EntityManager, aggregate: TAggregate): TRow {
    const row = em.create(this.options.entity, this.toRow(aggregate) as never) as TRow;
    em.persist(row);
    return row;
  }

  private async lockRow(em: EntityManager, aggregate: TAggregate): Promise<TRow> {
    const row = await em.findOne(this.options.entity, { id: aggregate.id.value } as never, {
      lockMode: LockMode.OPTIMISTIC,
      lockVersion: aggregate.version,
    });
    if (row === null) throw new OptimisticLockException(this.options.aggregateType, aggregate.id.value);
    return em.assign(row as TRow, this.toRow(aggregate) as never) as TRow;
  }

  private toOutboxRow(aggregateId: string, version: number, event: DomainEvent): OutboxEventRow {
    const { schemaVersion, correlationId, causationId, occurredAt, ...payload } = event as DomainEvent &
      Record<string, unknown>;
    return {
      id: generateUuidV7(),
      aggregateType: this.options.aggregateType,
      aggregateId,
      aggregateVersion: version,
      eventType: event.constructor.name,
      schemaVersion,
      payload,
      metadata: { correlationId, causationId },
      occurredAt,
      publishedAt: null,
    };
  }
}
