import { describe, expect, it } from 'vitest';

import { DateValueObject, FieldIsRequiredException } from '@house-radar/building-blocks';
import { known, ListingId, Money, UNKNOWN } from '@house-radar/shared-kernel';

import { ObservationBuilder } from '@contexts/listings/domain/builders/observation/observation.builder';
import { ObservationBuilderFactory } from '@contexts/listings/domain/builders/observation/observation-builder.factory';
import { ListingObservedEvent } from '@contexts/listings/domain/events/listing-observed/listing-observed.event';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';

const observedAt = new DateValueObject(new Date('2026-11-25T10:00:00.000Z'));

const baseBuilder = (): ObservationBuilder =>
  new ObservationBuilder()
    .withListingId(ListingId.generate())
    .withObservedAt(observedAt)
    .withPrice(known(Money.fromEuros(200000), 'declared'));

describe('Observation', () => {
  it('records the price and the date of a first observation (HR-F008-AC1)', () => {
    const observation = baseBuilder().build();

    expect(observation.price).toEqual(known(Money.fromEuros(200000), 'declared'));
    expect(observation.observedAt.value).toEqual(observedAt.value);
    expect(observation.status.value).toBe('active');
  });

  it('keeps an unknown price as unknown, never as zero', () => {
    const observation = baseBuilder().withPrice(UNKNOWN).build();

    expect(observation.toPrimitives().price).toEqual({ kind: 'unknown' });
  });

  it('has no run for a manual check and keeps the run otherwise', () => {
    const run = RunId.generate();

    expect(baseBuilder().build().runId).toBeUndefined();
    expect(baseBuilder().withRunId(run).build().runId?.equals(run)).toBe(true);
  });

  it('does not modify an earlier observation when a later one differs (HR-F008-AC11)', () => {
    const listingId = ListingId.generate();
    const earlier = baseBuilder().withListingId(listingId).withRunId(RunId.generate()).build();
    const before = JSON.stringify(earlier.toPrimitives());

    baseBuilder()
      .withListingId(listingId)
      .withRunId(RunId.generate())
      .withObservedAt(new DateValueObject(new Date('2026-11-26T10:00:00.000Z')))
      .withPrice(known(Money.fromEuros(190000), 'declared'))
      .withStatus(new ListingStatus('disappeared'))
      .build();

    expect(JSON.stringify(earlier.toPrimitives())).toBe(before);
  });

  it('offers no way to modify an observation (HR-F008-BR11)', () => {
    const observation = baseBuilder().build();
    const mutator = /^(set|update|change|modify|edit|correct|replace|reassign)/i;
    const names = new Set<string>();
    for (
      let proto = Object.getPrototypeOf(observation);
      proto !== Object.prototype;
      proto = Object.getPrototypeOf(proto)
    ) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (typeof descriptor?.set === 'function') names.add(`set ${name}`);
        else if (typeof descriptor?.value === 'function') names.add(name);
      }
    }

    expect([...names].filter((name) => mutator.test(name) || name.startsWith('set '))).toEqual([]);
  });

  it('does not let the snapshot be changed after creation', () => {
    const snapshot = { title: 'Piso' };
    const observation = baseBuilder().withSnapshot(snapshot).build();
    snapshot.title = 'Changed';

    expect(observation.snapshot).toEqual({ title: 'Piso' });
    expect(Object.isFrozen(observation.snapshot)).toBe(true);
  });

  it('conflicts with another observation of the same listing and the same run (D23)', () => {
    const listingId = ListingId.generate();
    const run = RunId.generate();
    const first = baseBuilder().withListingId(listingId).withRunId(run).build();

    expect(first.conflictsWith(baseBuilder().withListingId(listingId).withRunId(run).build())).toBe(true);
    expect(first.conflictsWith(baseBuilder().withListingId(listingId).withRunId(RunId.generate()).build())).toBe(false);
    expect(first.conflictsWith(baseBuilder().withRunId(run).build())).toBe(false);
  });

  it('never conflicts when there is no run: manual checks repeat freely', () => {
    const listingId = ListingId.generate();
    const first = baseBuilder().withListingId(listingId).build();

    expect(first.conflictsWith(baseBuilder().withListingId(listingId).build())).toBe(false);
  });

  it('records ListingObserved with the observation data', () => {
    const observation = baseBuilder().withRunId(RunId.generate()).build();
    observation.create();

    const [event] = observation.peekDomainEvents();
    expect(event).toBeInstanceOf(ListingObservedEvent);
    expect((event as ListingObservedEvent).payload).toEqual(observation.toPrimitives());
  });

  it('requires listing and observation date', () => {
    expect(() => new ObservationBuilder().withObservedAt(observedAt).build()).toThrow(FieldIsRequiredException);
    expect(() => new ObservationBuilder().withListingId(ListingId.generate()).build()).toThrow(
      FieldIsRequiredException,
    );
  });

  it('is created fresh by the stateless factory on every call', () => {
    const factory = new ObservationBuilderFactory();

    expect(factory.create()).toBeInstanceOf(ObservationBuilder);
    expect(factory.create()).not.toBe(factory.create());
  });
});
