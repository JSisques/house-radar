import { AggregateRoot } from '@house-radar/building-blocks';
import type { SourceId } from '@house-radar/shared-kernel';

import type { ISourceProps } from '@contexts/ingestion/domain/interfaces/source-props.interface';
import type { ISourcePrimitives } from '@contexts/ingestion/domain/primitives/source.primitives';
import type { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

/**
 * Where listings come from. Its identity is a stable key such as `manual`; cadence and rate limit
 * come from deployment configuration, not from the aggregate. It raises no events.
 */
export class SourceAggregate extends AggregateRoot<SourceId> {
  readonly kind: SourceKind;
  readonly enabled: boolean;

  constructor(props: ISourceProps) {
    super(props.id);
    this.kind = props.kind;
    this.enabled = props.enabled;
  }

  toPrimitives(): ISourcePrimitives {
    return { id: this.id.value, kind: this.kind.value, enabled: this.enabled };
  }
}
