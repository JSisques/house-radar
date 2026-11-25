import type { AggregateRoot } from '../aggregate-root/aggregate-root';
import type { ValueObject } from '../value-objects/value-object';

/** Write port: only `save`, `findById` and `delete`. */
export interface IWriteRepository<TId extends ValueObject<unknown, unknown>, TAggregate extends AggregateRoot<TId>> {
  save(aggregate: TAggregate): Promise<void>;
  findById(id: TId): Promise<TAggregate | null>;
  delete(id: TId): Promise<void>;
}
