// Path: src/contexts/<context>/domain/repositories/<name>.repository.port.ts
import type { PropertySummary } from '@contexts/search/domain/models/property-summary.model';
import type { SearchFilters } from '@contexts/search/domain/models/search-filters.model';

export interface IPropertySearchRepository {
  search(filters: SearchFilters): Promise<PropertySummary[]>;
}
