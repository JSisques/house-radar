import type { IWriteRepository } from '@house-radar/building-blocks';
import type { SourceId } from '@house-radar/shared-kernel';

import type { SourceAggregate } from '@contexts/ingestion/domain/aggregates/source/source.aggregate';
import type { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

export const SOURCE_WRITE_REPOSITORY = Symbol('SOURCE_WRITE_REPOSITORY');

export interface ISourceWriteRepository extends IWriteRepository<SourceId, SourceAggregate> {
  /** The source of this kind, for kinds that have a single one (`manual`). Null when none exists. */
  findByKind(kind: SourceKind): Promise<SourceAggregate | null>;
}
