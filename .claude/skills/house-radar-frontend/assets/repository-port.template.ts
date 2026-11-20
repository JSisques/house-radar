// Path: src/contexts/<context>/domain/repositories/<name>.repository.port.ts
import type { PropertySummary } from '@contexts/search/domain/models/property-summary.model';

export interface SearchFilters {
  readonly minPrice?: number;
  readonly maxPrice?: number;
}

export interface IPropertySearchRepository {
  search(filters: SearchFilters): Promise<PropertySummary[]>;
}
