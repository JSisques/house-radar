import type { IBuilderFactory } from '@house-radar/building-blocks';

import { PropertyBuilder } from '@contexts/properties/domain/builders/property/property.builder';

export const PROPERTY_BUILDER_FACTORY_TOKEN = Symbol('PROPERTY_BUILDER_FACTORY');

export type IPropertyBuilderFactory = IBuilderFactory<PropertyBuilder>;

export class PropertyBuilderFactory implements IPropertyBuilderFactory {
  create(): PropertyBuilder {
    return new PropertyBuilder();
  }
}
