import { describe, expect, it } from 'vitest';

import { SourceId } from '@house-radar/shared-kernel';

import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';
import { InvalidSourceKindException } from '@contexts/ingestion/domain/exceptions/invalid-source-kind/invalid-source-kind.exception';
import { InvalidSourceNameException } from '@contexts/ingestion/domain/exceptions/invalid-source-name/invalid-source-name.exception';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

const ID = SourceId.generate();

import { SourceName } from '@contexts/ingestion/domain/value-objects/source-name/source-name.value-object';

describe('SourceAggregate', () => {
  it('exposes its primitives and raises no events', () => {
    const source = new SourceBuilder().withId(ID).withName(SourceName.manual()).withKind(SourceKind.manual()).build();

    expect(source.toPrimitives()).toEqual({ id: ID.value, name: 'manual', kind: 'manual', enabled: true });
    expect(source.peekDomainEvents()).toEqual([]);
  });

  it('can be built disabled', () => {
    const source = new SourceBuilder()
      .withId(ID)
      .withName(SourceName.manual())
      .withKind(SourceKind.manual())
      .withEnabled(false)
      .build();

    expect(source.enabled).toBe(false);
  });

  it('requires id, name and kind', () => {
    const name = SourceName.manual();
    const kind = SourceKind.manual();
    expect(() => new SourceBuilder().withName(name).withKind(kind).build()).toThrow();
    expect(() => new SourceBuilder().withId(ID).withKind(kind).build()).toThrow();
    expect(() => new SourceBuilder().withId(ID).withName(name).build()).toThrow();
  });

  it.each(['', ' idealista', 'idealista '])('rejects the name %j', (value) => {
    expect(() => new SourceName(value)).toThrow(InvalidSourceNameException);
  });

  it('rejects an unknown kind', () => {
    expect(() => new SourceKind('rss')).toThrow(InvalidSourceKindException);
  });
});
