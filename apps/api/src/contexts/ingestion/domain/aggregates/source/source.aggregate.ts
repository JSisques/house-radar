import { AggregateRoot } from '@house-radar/building-blocks';
import type { SourceId } from '@house-radar/shared-kernel';

import type { ISourceProps } from '@contexts/ingestion/domain/interfaces/source-props.interface';
import type { ISourcePrimitives } from '@contexts/ingestion/domain/primitives/source.primitives';
import type { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';
import type { SourceName } from '@contexts/ingestion/domain/value-objects/source-name/source-name.value-object';

/**
 * Where listings come from. Its identity is a UUIDv7; the name (`idealista`, `manual`...) says which
 * source it is. Cadence and rate limit come from deployment configuration, not from the aggregate.
 * It raises no events.
 */
export class SourceAggregate extends AggregateRoot<SourceId> {
  readonly name: SourceName;
  readonly kind: SourceKind;
  readonly enabled: boolean;

  constructor(props: ISourceProps) {
    super(props.id);
    this.name = props.name;
    this.kind = props.kind;
    this.enabled = props.enabled;
  }

  toPrimitives(): ISourcePrimitives {
    return { id: this.id.value, name: this.name.value, kind: this.kind.value, enabled: this.enabled };
  }
}
