import type { SourceId } from '@house-radar/shared-kernel';

import type { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

/** What the aggregate constructor needs to hydrate a source. */
export interface ISourceProps {
  id: SourceId;
  kind: SourceKind;
  enabled: boolean;
}
