import type { IBuilderFactory } from '@house-radar/building-blocks';

import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';

export const SOURCE_BUILDER_FACTORY_TOKEN = Symbol('SOURCE_BUILDER_FACTORY');

export type ISourceBuilderFactory = IBuilderFactory<SourceBuilder>;

export class SourceBuilderFactory implements ISourceBuilderFactory {
  create(): SourceBuilder {
    return new SourceBuilder();
  }
}
