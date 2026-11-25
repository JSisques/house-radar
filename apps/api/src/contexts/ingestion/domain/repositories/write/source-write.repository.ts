import type { IWriteRepository } from '@house-radar/building-blocks';
import type { SourceId } from '@house-radar/shared-kernel';

import type { SourceAggregate } from '@contexts/ingestion/domain/aggregates/source/source.aggregate';

export const SOURCE_WRITE_REPOSITORY = Symbol('SOURCE_WRITE_REPOSITORY');

export type ISourceWriteRepository = IWriteRepository<SourceId, SourceAggregate>;
