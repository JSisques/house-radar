import type { IPropertySearchViewPrimitives } from '@contexts/properties/domain/primitives/property-search-view.primitives';

export const PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN = Symbol('PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN');

/** Stores the read model of a property, replacing the previous one. */
export interface IPropertySearchViewRepository {
  save(view: IPropertySearchViewPrimitives): Promise<void>;
}
