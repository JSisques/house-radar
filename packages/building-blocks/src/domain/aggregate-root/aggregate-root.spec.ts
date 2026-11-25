import { describe, expect, it } from 'vitest';

import { DomainEvent } from '../events/domain-event';
import { UuidValueObject } from '../value-objects/uuid/uuid.value-object';
import { AggregateRoot } from './aggregate-root';

const ID_A = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const ID_B = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c';

class SampleEvent extends DomainEvent {
  constructor() {
    super();
  }
}

class SampleAggregate extends AggregateRoot<UuidValueObject> {
  doSomething(event: DomainEvent): void {
    this.record(event);
  }
}

describe('AggregateRoot', () => {
  it('is new with version 0 when created', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));

    expect(aggregate.isNew()).toBe(true);
    expect(aggregate.version).toBe(0);
  });

  it('does not drain the buffer when peeking twice', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));
    const event = new SampleEvent();
    aggregate.doSomething(event);

    expect(aggregate.peekDomainEvents()).toEqual([event]);
    expect(aggregate.peekDomainEvents()).toEqual([event]);
  });

  it('does not let callers mutate the buffer through the peeked array', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));
    aggregate.doSomething(new SampleEvent());

    (aggregate.peekDomainEvents() as DomainEvent[]).pop();

    expect(aggregate.peekDomainEvents()).toHaveLength(1);
  });

  it('keeps events in recording order', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));
    const first = new SampleEvent();
    const second = new SampleEvent();
    aggregate.doSomething(first);
    aggregate.doSomething(second);

    expect(aggregate.peekDomainEvents()).toEqual([first, second]);
    expect(aggregate.peekDomainEvents()[0]).toBe(first);
  });

  it('is not new and takes the version after markPersisted(3)', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));

    aggregate.markPersisted(3);

    expect(aggregate.isNew()).toBe(false);
    expect(aggregate.version).toBe(3);
  });

  it('empties the buffer on clearDomainEvents', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));
    aggregate.doSomething(new SampleEvent());

    aggregate.clearDomainEvents();

    expect(aggregate.peekDomainEvents()).toEqual([]);
  });

  it('exposes its id', () => {
    const id = new UuidValueObject(ID_A);

    expect(new SampleAggregate(id).id).toBe(id);
  });

  it('is equal to another aggregate of the same class and id', () => {
    const aggregate = new SampleAggregate(new UuidValueObject(ID_A));

    expect(aggregate.equals(new SampleAggregate(new UuidValueObject(ID_A)))).toBe(true);
    expect(aggregate.equals(new SampleAggregate(new UuidValueObject(ID_B)))).toBe(false);
    expect(aggregate.equals(null)).toBe(false);
    expect(aggregate.equals(undefined)).toBe(false);
  });

  it('is not equal to an aggregate of another class with the same id', () => {
    class OtherAggregate extends AggregateRoot<UuidValueObject> {}

    expect(new SampleAggregate(new UuidValueObject(ID_A)).equals(new OtherAggregate(new UuidValueObject(ID_A)))).toBe(
      false,
    );
  });
});
