import { Inject, Injectable } from '@nestjs/common';

import { SourceId } from '@house-radar/shared-kernel';

import type { SourceAggregate } from '@contexts/ingestion/domain/aggregates/source/source.aggregate';
import {
  type ISourceBuilderFactory,
  SOURCE_BUILDER_FACTORY_TOKEN,
} from '@contexts/ingestion/domain/builders/source/source-builder.factory';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';
import type { SourceRow } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/schemas/source.schema';

/** Maps the source aggregate to its table row and back. */
@Injectable()
export class SourceRowMapper {
  constructor(@Inject(SOURCE_BUILDER_FACTORY_TOKEN) private readonly builders: ISourceBuilderFactory) {}

  toRow(aggregate: SourceAggregate): Omit<SourceRow, 'createdAt' | 'updatedAt'> {
    const p = aggregate.toPrimitives();
    return { id: p.id, kind: p.kind, enabled: p.enabled };
  }

  toAggregate(row: SourceRow): SourceAggregate {
    return this.builders
      .create()
      .withId(new SourceId(row.id))
      .withKind(new SourceKind(row.kind))
      .withEnabled(row.enabled)
      .build();
  }
}
