import { EntitySchema, MikroORM } from '@mikro-orm/postgresql';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AggregateRoot, DomainEvent, generateUuidV7, UuidValueObject } from '@house-radar/building-blocks';
import { createOutboxEventSchema, outboxEventEntityName } from '@house-radar/outbox';
import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { runMigrations } from '@core/persistence/migrations/run-migrations.js';
import { OptimisticLockException } from '@core/persistence/optimistic-lock/optimistic-lock.exception.js';
import { createOrmOptions } from '@core/persistence/orm-config/orm-config.js';
import { OutboxWriteRepository } from '@core/persistence/outbox/outbox-write.repository.js';
import { MikroOrmTransactionManager } from '@core/persistence/transaction-manager/mikro-orm-transaction-manager.js';

class WidgetId extends UuidValueObject {}

class WidgetRenamed extends DomainEvent {
  constructor(readonly name: string) {
    super();
  }
}

class Widget extends AggregateRoot<WidgetId> {
  constructor(
    id: WidgetId,
    public name: string,
  ) {
    super(id);
  }

  rename(name: string): void {
    this.name = name;
    this.record(new WidgetRenamed(name));
  }
}

interface WidgetRow {
  id: string;
  name: string;
  version: number;
}

const WidgetSchema = new EntitySchema<WidgetRow>({
  name: 'Widget',
  schema: 'listings',
  tableName: 'widget',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'text' },
    version: { type: 'integer', version: true },
  },
});

class WidgetRepository extends OutboxWriteRepository<WidgetId, Widget, WidgetRow> {
  constructor(orm: MikroORM) {
    super(orm.em, { entity: WidgetSchema, outboxSchema: 'listings', aggregateType: 'Widget' });
  }

  protected toRow(aggregate: Widget): Omit<WidgetRow, 'version'> {
    return { id: aggregate.id.value, name: aggregate.name };
  }

  protected toAggregate(row: WidgetRow): Widget {
    const widget = new Widget(new WidgetId(row.id), row.name);
    widget.markPersisted(row.version);
    return widget;
  }
}

describe('OutboxWriteRepository', () => {
  let postgres: StartedPostgres;
  let pool: pg.Pool;
  let orm: MikroORM;
  let repository: WidgetRepository;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    pool = new pg.Pool({ connectionString: postgres.connectionUri });
    await pool.query(
      'create table listings.widget (id uuid primary key, name text not null, version int not null default 1)',
    );
    orm = await MikroORM.init(
      createOrmOptions('listings', postgres.connectionUri, {
        entities: [WidgetSchema, createOutboxEventSchema('listings')],
      }),
    );
    repository = new WidgetRepository(orm);
  });
  afterEach(async () => {
    await pool.query('drop trigger if exists fail_commit on listings.outbox_event');
    await pool.query('truncate listings.widget, listings.outbox_event');
  });
  afterAll(async () => {
    await orm.close(true);
    await pool.end();
    await postgres.stop();
  });

  async function outboxRows() {
    const { rows } = await pool.query(
      'select id, aggregate_type, aggregate_id, aggregate_version, event_type, schema_version, payload, metadata, occurred_at, published_at from listings.outbox_event order by id',
    );
    return rows;
  }

  function insertWidget(id: string) {
    return orm.em
      .getConnection()
      .execute(`insert into listings.widget values ('${id}', 'x', 1)`, [], 'run', orm.em.getTransactionContext());
  }

  function newWidget(): Widget {
    const widget = new Widget(new WidgetId(generateUuidV7()), 'first');
    widget.rename('second');
    widget.rename('third');
    return widget;
  }

  it('should store both events in the outbox with the aggregate version when an aggregate with two events is saved', async () => {
    const widget = newWidget();

    await repository.save(widget);

    const rows = await outboxRows();
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({
        aggregate_type: 'Widget',
        aggregate_id: widget.id.value,
        aggregate_version: 1,
        event_type: 'WidgetRenamed',
        schema_version: 1,
        published_at: null,
      });
      expect(row.metadata).toEqual({ correlationId: expect.any(String), causationId: null });
    }
    expect(rows.map((row) => row.payload).sort((a, b) => a.name.localeCompare(b.name))).toEqual([
      { name: 'second' },
      { name: 'third' },
    ]);
    expect(widget.peekDomainEvents()).toHaveLength(0);
    expect(widget.version).toBe(1);
    expect(widget.isNew()).toBe(false);
  });

  it('should bump the version and tag the new events with it when a stored aggregate is saved again', async () => {
    const widget = newWidget();
    await repository.save(widget);
    const loaded = await repository.findById(widget.id);
    loaded?.rename('fourth');

    await repository.save(loaded as Widget);

    const versions = (await outboxRows()).map((row) => row.aggregate_version).sort();
    expect(versions).toEqual([1, 1, 2]);
    expect(loaded?.version).toBe(2);
  });

  it('should leave no outbox rows and keep the events when the transaction rolls back after the insert', async () => {
    await pool.query(`
      create function listings.fail_commit() returns trigger language plpgsql as $$ begin raise exception 'boom'; end $$;
      create constraint trigger fail_commit after insert on listings.outbox_event
        deferrable initially deferred for each row execute function listings.fail_commit();
    `);
    const widget = newWidget();

    await expect(repository.save(widget)).rejects.toThrow();

    expect(await outboxRows()).toHaveLength(0);
    expect((await pool.query('select 1 from listings.widget')).rowCount).toBe(0);
    expect(widget.peekDomainEvents()).toHaveLength(2);
    expect(widget.isNew()).toBe(true);
    expect(widget.version).toBe(0);
  });

  it('should raise an optimistic lock exception when a stale version is saved', async () => {
    const widget = newWidget();
    await repository.save(widget);
    const first = await repository.findById(widget.id);
    const second = await repository.findById(widget.id);
    first?.rename('winner');
    await repository.save(first as Widget);
    second?.rename('stale');

    await expect(repository.save(second as Widget)).rejects.toBeInstanceOf(OptimisticLockException);

    expect(await outboxRows()).toHaveLength(3);
    expect(second?.peekDomainEvents()).toHaveLength(1);
  });

  it('should delete the aggregate row', async () => {
    const widget = newWidget();
    await repository.save(widget);

    await repository.delete(widget.id);

    expect(await repository.findById(widget.id)).toBeNull();
  });

  it('should expose the entity name used for each context outbox', () => {
    expect(outboxEventEntityName('listings')).toBe('ListingsOutboxEvent');
  });

  it('should commit the work of a transaction manager run and roll it back when it throws', async () => {
    const transactions = new MikroOrmTransactionManager(orm.em);
    const id = generateUuidV7();

    await expect(
      transactions.run(async () => {
        await insertWidget(id);
        throw new Error('abort');
      }),
    ).rejects.toThrow('abort');
    expect((await pool.query('select 1 from listings.widget')).rowCount).toBe(0);

    await transactions.run(() => insertWidget(id));
    expect((await pool.query('select 1 from listings.widget')).rowCount).toBe(1);
  });
});
