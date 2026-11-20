// Path: src/contexts/<context>/application/use-cases/<verb-noun>/<verb-noun>.use-case.ts
// Always create the use case, even when it only delegates to the port.
import type { PropertySummary } from '@contexts/search/domain/models/property-summary.model';
import type { SearchFilters } from '@contexts/search/domain/models/search-filters.model';
import type { IPropertySearchRepository } from '@contexts/search/domain/repositories/property-search.repository.port';

export class SearchPropertiesUseCase {
  constructor(private readonly propertySearchRepository: IPropertySearchRepository) {}

  execute(filters: SearchFilters): Promise<PropertySummary[]> {
    return this.propertySearchRepository.search(filters);
  }
}
