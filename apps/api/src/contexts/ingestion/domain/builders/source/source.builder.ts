import { Builder } from '@house-radar/building-blocks';
import type { SourceId } from '@house-radar/shared-kernel';

import { SourceAggregate } from '@contexts/ingestion/domain/aggregates/source/source.aggregate';
import type { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';
import type { SourceName } from '@contexts/ingestion/domain/value-objects/source-name/source-name.value-object';

/** Builds a source. It is enabled unless stated otherwise. */
export class SourceBuilder extends Builder<SourceAggregate> {
  private idValue?: SourceId;
  private nameValue?: SourceName;
  private kindValue?: SourceKind;
  private enabledValue = true;

  withId(id: SourceId): this {
    this.idValue = id;
    return this;
  }

  withName(name: SourceName): this {
    this.nameValue = name;
    return this;
  }

  withKind(kind: SourceKind): this {
    this.kindValue = kind;
    return this;
  }

  withEnabled(enabled: boolean): this {
    this.enabledValue = enabled;
    return this;
  }

  protected requiredFields(): Readonly<Record<string, unknown>> {
    return { id: this.idValue, name: this.nameValue, kind: this.kindValue };
  }

  build(): SourceAggregate {
    this.validate();
    return new SourceAggregate({
      id: this.idValue as SourceId,
      name: this.nameValue as SourceName,
      kind: this.kindValue as SourceKind,
      enabled: this.enabledValue,
    });
  }
}
