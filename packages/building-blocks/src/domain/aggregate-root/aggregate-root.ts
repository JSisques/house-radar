import type { DomainEvent } from '../events/domain-event';
import type { ValueObject } from '../value-objects/value-object';

/**
 * Base for every aggregate. Keeps its own event buffer and the optimistic-locking state.
 * The write repository calls `markPersisted(version)` after commit and `clearDomainEvents()`
 * only once the events are safely stored.
 */
export abstract class AggregateRoot<TId extends ValueObject<unknown, unknown>> {
  private events: DomainEvent[] = [];
  private _version = 0;
  private persisted = false;

  constructor(readonly id: TId) {}

  get version(): number {
    return this._version;
  }

  /** True until the first save. */
  isNew(): boolean {
    return !this.persisted;
  }

  /** Syncs the version bumped by the database and marks the aggregate as stored. */
  markPersisted(version: number): void {
    this._version = version;
    this.persisted = true;
  }

  protected record(event: DomainEvent): void {
    this.events.push(event);
  }

  /** Reads the buffer without draining it. */
  peekDomainEvents(): readonly DomainEvent[] {
    return [...this.events];
  }

  clearDomainEvents(): void {
    this.events = [];
  }

  /** Same class and equal id. Null-safe. */
  equals(other: AggregateRoot<TId> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return this.id.equals(other.id);
  }
}
