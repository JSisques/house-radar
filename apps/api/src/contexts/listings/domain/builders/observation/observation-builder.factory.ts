import type { IBuilderFactory } from '@house-radar/building-blocks';

import { ObservationBuilder } from '@contexts/listings/domain/builders/observation/observation.builder';

export const OBSERVATION_BUILDER_FACTORY_TOKEN = Symbol('OBSERVATION_BUILDER_FACTORY');

export type IObservationBuilderFactory = IBuilderFactory<ObservationBuilder>;

export class ObservationBuilderFactory implements IObservationBuilderFactory {
  create(): ObservationBuilder {
    return new ObservationBuilder();
  }
}
