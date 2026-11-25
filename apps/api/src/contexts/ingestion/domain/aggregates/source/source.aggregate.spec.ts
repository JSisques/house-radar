import { describe, expect, it } from 'vitest';

import { SourceId } from '@house-radar/shared-kernel';

import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';
import { InvalidSourceKindException } from '@contexts/ingestion/domain/exceptions/invalid-source-kind/invalid-source-kind.exception';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

describe('SourceAggregate', () => {
  it('exposes its primitives and raises no events', () => {
    const source = new SourceBuilder().withId(new SourceId('manual')).withKind(SourceKind.manual()).build();

    expect(source.toPrimitives()).toEqual({ id: 'manual', kind: 'manual', enabled: true });
    expect(source.peekDomainEvents()).toEqual([]);
  });

  it('can be built disabled', () => {
    const source = new SourceBuilder()
      .withId(new SourceId('manual'))
      .withKind(SourceKind.manual())
      .withEnabled(false)
      .build();

    expect(source.enabled).toBe(false);
  });

  it('requires id and kind', () => {
    expect(() => new SourceBuilder().withKind(SourceKind.manual()).build()).toThrow();
    expect(() => new SourceBuilder().withId(new SourceId('manual')).build()).toThrow();
  });

  it('rejects an unknown kind', () => {
    expect(() => new SourceKind('rss')).toThrow(InvalidSourceKindException);
  });
});
