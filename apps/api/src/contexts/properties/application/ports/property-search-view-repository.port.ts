import type { IPropertySearchViewModel } from '@contexts/properties/application/view-models/property-search-view/property-search-view.view-model';

export const PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN = Symbol('PROPERTY_SEARCH_VIEW_REPOSITORY_TOKEN');

/** Stores the read model of a property, replacing the previous one. */
export interface IPropertySearchViewRepository {
  save(view: IPropertySearchViewModel): Promise<void>;
}
